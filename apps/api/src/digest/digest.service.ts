import { createHmac, timingSafeEqual } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { and, desc, eq, gte, isNotNull, lte, or, sql } from "drizzle-orm";
import { todayInIndia } from "../common/zod";
import { CONFIG, type AppConfig } from "../config";
import { ConsentService } from "../consent/consent.service";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { articles, digestSends, events, policyItems, schemes, startups, type Startup, users } from "../db/schema";
import { type Mail, MailerService } from "../mail/mailer.service";
import { shortDate, siteLink, tFor } from "../mail/templates";
import type { Locale } from "@foundura/shared";
import { type ScanMatch, ScanService } from "../scan/scan.service";
import { toScanInput } from "../startups/startups.service";

type Snapshot = { slug: string; status: "eligible" | "maybe" }[];

export interface DigestContent {
  startupName: string | null;
  newSchemes: ScanMatch[];
  moreNew: number;
  /** Counts over all new schemes, including those past the list limit. */
  newEligible: number;
  newMaybe: number;
  updatedSchemes: ScanMatch[];
  deadlines: (typeof events.$inferSelect)[];
  policy: (typeof policyItems.$inferSelect)[];
  guides: (typeof articles.$inferSelect)[];
  snapshot: Snapshot;
}

export interface DigestRunResult {
  weekOf: string;
  recipients: number;
  sent: number;
  alreadySent: number;
  nothingNew: number;
  failed: number;
}

const MAX_NEW = 6;
const DAY = 86_400_000;

const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

/** Monday of the week containing `iso` (a date in India time). */
export function weekOf(iso: string): string {
  const dow = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(iso, -((dow + 6) % 7));
}


/**
 * The weekly scheme-alerts email. Goes only to people whose latest `scheme_alerts` consent is a
 * grant, at most once per week, and only when there is something new to say.
 */
@Injectable()
export class DigestService {
  private readonly log = new Logger(DigestService.name);

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(ScanService) private readonly scan: ScanService,
    @Inject(ConsentService) private readonly consents: ConsentService,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  // ----- unsubscribe tokens -----

  unsubscribeToken(userId: string): string {
    return createHmac("sha256", this.config.JWT_SECRET).update(`unsubscribe:${userId}`).digest("base64url");
  }

  unsubscribeUrl(userId: string, locale: Locale = "en"): string {
    return `${siteLink(this.mailer.siteUrl, locale, "/unsubscribe")}?u=${encodeURIComponent(userId)}&t=${this.unsubscribeToken(userId)}`;
  }

  /** One-click unsubscribe: records a withdrawal in the consent ledger. Returns false for a bad link. */
  async unsubscribe(userId: string, token: string): Promise<boolean> {
    const expected = Buffer.from(this.unsubscribeToken(userId));
    const given = Buffer.from(token);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
    const [u] = await this.db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (!u) return true; // account already deleted: nothing left to stop
    await this.consents.record(userId, "scheme_alerts", false, { onlyIfChanged: true });
    return true;
  }

  // ----- content -----

  private async recipientIds(): Promise<string[]> {
    const r = await this.db.execute<{ user_id: string }>(sql`
      select user_id from (
        select distinct on (user_id) user_id, granted
        from consents where purpose = 'scheme_alerts'
        order by user_id, created_at desc
      ) latest where granted = true
    `);
    return r.rows.map((x) => x.user_id);
  }

  /** Content shared by every recipient this week: deadlines, policy news, new guides. */
  async sharedContent(today = todayInIndia()) {
    const in14 = addDays(today, 14);
    const weekAgo = addDays(today, -7);
    const [deadlines, policy, guides] = await Promise.all([
      this.db
        .select()
        .from(events)
        .where(
          or(
            and(isNotNull(events.deadline), gte(events.deadline, today), lte(events.deadline, in14)),
            and(gte(events.startDate, today), lte(events.startDate, in14)),
          ),
        )
        .orderBy(sql`coalesce(${events.deadline}, ${events.startDate})`)
        .limit(5),
      this.db
        .select()
        .from(policyItems)
        .where(and(gte(policyItems.date, weekAgo), lte(policyItems.date, today)))
        .orderBy(sql`case ${policyItems.impact} when 'High' then 0 when 'Medium' then 1 else 2 end`, desc(policyItems.date))
        .limit(4),
      this.db
        .select()
        .from(articles)
        .where(and(gte(articles.publishedAt, weekAgo), lte(articles.publishedAt, today)))
        .orderBy(desc(articles.publishedAt))
        .limit(3),
    ]);
    return { deadlines, policy, guides };
  }

  async compose(
    startup: Startup | null,
    previous: { schemes: Snapshot; sentAt: Date } | null,
    shared: Awaited<ReturnType<DigestService["sharedContent"]>>,
    today = todayInIndia(),
  ): Promise<DigestContent> {
    let newSchemes: ScanMatch[] = [];
    let updatedSchemes: ScanMatch[] = [];
    let snapshot: Snapshot = [];

    if (startup) {
      const result = await this.scan.scan(toScanInput(startup), today);
      const relevant = result.matches.filter(
        (m): m is ScanMatch & { status: "eligible" | "maybe" } =>
          (m.status === "eligible" || m.status === "maybe") && m.scheme.status !== "closed",
      );
      snapshot = relevant.map((m) => ({ slug: m.scheme.slug, status: m.status }));

      const before = new Map((previous?.schemes ?? []).map((s) => [s.slug, s.status]));
      newSchemes = relevant.filter((m) => {
        const was = before.get(m.scheme.slug);
        return !was || (was === "maybe" && m.status === "eligible");
      });

      if (previous) {
        const changed = await this.db
          .select({ slug: schemes.slug })
          .from(schemes)
          .where(gte(schemes.updatedAt, previous.sentAt));
        const changedSlugs = new Set(changed.map((c) => c.slug));
        const newSlugs = new Set(newSchemes.map((m) => m.scheme.slug));
        updatedSchemes = relevant.filter((m) => changedSlugs.has(m.scheme.slug) && !newSlugs.has(m.scheme.slug)).slice(0, 4);
      }
    }

    return {
      startupName: startup?.name ?? null,
      newSchemes: newSchemes.slice(0, MAX_NEW),
      moreNew: Math.max(0, newSchemes.length - MAX_NEW),
      newEligible: newSchemes.filter((m) => m.status === "eligible").length,
      newMaybe: newSchemes.filter((m) => m.status === "maybe").length,
      updatedSchemes,
      ...shared,
      snapshot,
    };
  }

  hasNews(c: DigestContent): boolean {
    return c.newSchemes.length + c.updatedSchemes.length + c.deadlines.length + c.policy.length + c.guides.length > 0;
  }

  render(c: DigestContent, unsubscribeUrl: string, locale: Locale = "en"): Pick<Mail, "subject" | "text"> {
    const site = this.mailer.siteUrl;
    const link = (path: string) => siteLink(site, locale, path);
    const T = tFor(locale).digest;
    const L: string[] = [];

    const bits = [
      c.newEligible && T.qualify(c.newEligible),
      !c.newEligible && c.newMaybe && T.worthChecking(c.newMaybe),
      c.deadlines.length && T.deadlines(c.deadlines.length),
      c.policy.length && T.policy(c.policy.length),
    ].filter(Boolean);
    const subject = bits.length ? `${T.subjectBase}: ${bits.join(", ")}` : T.subjectBase;

    L.push(T.hi, "", c.startupName ? T.introFor(c.startupName) : T.introGeneral);
    if (T.inEnglish) L.push(T.inEnglish);
    if (!c.startupName) L.push("", T.addProfile, link("/dashboard"));

    if (c.newSchemes.length) {
      L.push("", T.newForYou, "");
      for (const m of c.newSchemes) {
        const why = m.status === "eligible" ? T.youQualify : T.youMay(m.unknown.length);
        L.push(`- ${m.scheme.name}: ${why}`, `  ${link(`/schemes/${m.scheme.slug}`)}`);
      }
      if (c.moreNew) L.push(T.more(c.moreNew, link("/dashboard")));
    }

    if (c.updatedSchemes.length) {
      L.push("", T.updated, "");
      for (const m of c.updatedSchemes) {
        const note = m.scheme.lastVerifiedAt ? T.checkedOn(shortDate(m.scheme.lastVerifiedAt, locale)) : T.changed;
        L.push(`- ${m.scheme.name}: ${note}`, `  ${link(`/schemes/${m.scheme.slug}`)}`);
      }
    }

    if (c.deadlines.length) {
      L.push("", T.comingUp, "");
      for (const e of c.deadlines) {
        const when = e.deadline ? T.applyBy(shortDate(e.deadline, locale)) : T.starts(shortDate(e.startDate!, locale));
        const where = e.city ? `, ${e.city}` : "";
        L.push(`- ${e.name}: ${when}${where}${e.status === "To verify" ? T.unconfirmed : ""}`);
        if (e.sourceUrl) L.push(`  ${e.sourceUrl}`);
      }
    }

    if (c.policy.length) {
      L.push("", T.policyNews, "");
      for (const p of c.policy) L.push(`- ${p.headline} (${p.country})`, `  ${p.takeaway}`, `  ${p.sourceUrl}`);
    }

    if (c.guides.length) {
      L.push("", T.guides, "");
      for (const a of c.guides) L.push(`- ${a.title} (${T.minRead(a.readMinutes)})`, `  ${link(`/learn/${a.slug}`)}`);
    }

    L.push("", T.confirm, "", "--", T.why, T.stop(unsubscribeUrl), T.money);
    return { subject, text: L.join("\n") };
  }

  // ----- sending -----

  /** Send this week's digest. Safe to run more than once: each person gets at most one per week. */
  async run(today = todayInIndia()): Promise<DigestRunResult> {
    const week = weekOf(today);
    const ids = await this.recipientIds();
    const shared = await this.sharedContent(today);
    const result: DigestRunResult = { weekOf: week, recipients: ids.length, sent: 0, alreadySent: 0, nothingNew: 0, failed: 0 };

    for (const userId of ids) {
      const [already] = await this.db
        .select({ id: digestSends.id })
        .from(digestSends)
        .where(and(eq(digestSends.userId, userId), eq(digestSends.weekOf, week)))
        .limit(1);
      if (already) {
        result.alreadySent++;
        continue;
      }
      const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) continue;
      const [startup] = await this.db.select().from(startups).where(eq(startups.ownerId, userId)).orderBy(startups.createdAt).limit(1);
      const [previous] = await this.db
        .select({ schemes: digestSends.schemes, sentAt: digestSends.sentAt })
        .from(digestSends)
        .where(eq(digestSends.userId, userId))
        .orderBy(desc(digestSends.sentAt))
        .limit(1);

      const content = await this.compose(startup ?? null, previous ?? null, shared, today);
      if (!this.hasNews(content)) {
        result.nothingNew++;
        continue;
      }
      // Claim this person's slot for the week before sending, so parallel runs can't double-send.
      const [claimed] = await this.db
        .insert(digestSends)
        .values({ userId, weekOf: week, schemes: content.snapshot })
        .onConflictDoNothing()
        .returning({ id: digestSends.id });
      if (!claimed) {
        result.alreadySent++;
        continue;
      }
      try {
        await this.mailer.send({
          to: user.email,
          ...this.render(content, this.unsubscribeUrl(userId, user.locale), user.locale),
          headers: {
            "List-Unsubscribe": `<${this.mailer.siteUrl}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${this.unsubscribeToken(userId)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        result.sent++;
        if (!this.mailer.isDev) await new Promise((r) => setTimeout(r, 600)); // stay under the email provider's rate limit
      } catch (e) {
        await this.db.delete(digestSends).where(eq(digestSends.id, claimed.id)); // let the next run retry
        result.failed++;
        this.log.error(`Digest to user ${userId} failed: ${(e as Error).message}`);
      }
    }
    this.log.log(`Digest ${week}: ${JSON.stringify(result)}`);
    return result;
  }

  exportFor(userId: string) {
    return this.db.select().from(digestSends).where(eq(digestSends.userId, userId)).orderBy(desc(digestSends.sentAt));
  }
}
