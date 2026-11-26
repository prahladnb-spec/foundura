import { createHmac, timingSafeEqual } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { PRIVACY_NOTICE_VERSION, type Locale } from "@foundura/shared";
import { and, asc, eq, gte, isNotNull, isNull, lt, ne, or, sql } from "drizzle-orm";
import { todayInIndia } from "../common/zod";
import { CONFIG, type AppConfig } from "../config";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { newsletterSubscribers, schemes } from "../db/schema";
import { type Mail, MailerService } from "../mail/mailer.service";
import { shortDate, siteLink, tFor } from "../mail/templates";
import { localizeScheme } from "../schemes/localize";
import { DigestService, weekOf } from "./digest.service";

const DAY = 86_400_000;
/** Don't send another confirmation email to the same address within this time. */
const RESEND_AFTER = 10 * 60_000;
const MAX_NEW = 8;

type Purpose = "confirm" | "stop";

export interface NewsletterRunResult {
  weekOf: string;
  subscribers: number;
  sent: number;
  alreadySent: number;
  nothingNew: number;
  failed: number;
  expired: number;
}

/**
 * The weekly email for people without an account: new schemes, deadlines, policy news and guides,
 * the same for everyone (nothing is known about the reader but their address and language).
 * Double opt-in; unsubscribing deletes the address.
 */
@Injectable()
export class NewsletterService {
  private readonly log = new Logger(NewsletterService.name);

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(MailerService) private readonly mailer: MailerService,
    @Inject(DigestService) private readonly digest: DigestService,
  ) {}

  // ----- links -----

  token(id: string, purpose: Purpose): string {
    return createHmac("sha256", this.config.JWT_SECRET).update(`newsletter:${purpose}:${id}`).digest("base64url");
  }

  private valid(id: string, purpose: Purpose, token: string): boolean {
    const expected = Buffer.from(this.token(id, purpose));
    const given = Buffer.from(token);
    return given.length === expected.length && timingSafeEqual(given, expected);
  }

  confirmUrl(id: string, locale: Locale): string {
    return `${siteLink(this.mailer.siteUrl, locale, "/newsletter/confirm")}?s=${encodeURIComponent(id)}&t=${this.token(id, "confirm")}`;
  }

  stopUrl(id: string, locale: Locale): string {
    return `${siteLink(this.mailer.siteUrl, locale, "/unsubscribe")}?s=${encodeURIComponent(id)}&t=${this.token(id, "stop")}`;
  }

  // ----- subscribing -----

  /**
   * Ask for the weekly email. Always gives the same answer, so nobody can find out whether an address
   * is already subscribed. Sends a confirmation email unless the address is confirmed already or one
   * went out in the last few minutes.
   */
  async subscribe(rawEmail: string, locale: Locale): Promise<{ ok: true }> {
    const email = rawEmail.trim().toLowerCase();
    const [existing] = await this.db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
    if (existing?.confirmedAt) return { ok: true };
    if (existing?.confirmSentAt && Date.now() - existing.confirmSentAt.getTime() < RESEND_AFTER) return { ok: true };

    const [row] = existing
      ? await this.db
          .update(newsletterSubscribers)
          .set({ locale, confirmSentAt: new Date() })
          .where(eq(newsletterSubscribers.id, existing.id))
          .returning()
      : await this.db
          .insert(newsletterSubscribers)
          .values({ email, locale, confirmSentAt: new Date() })
          .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { confirmSentAt: new Date() } })
          .returning();
    await this.mailer.send({ to: email, ...tFor(locale).newsletter.confirm(this.confirmUrl(row.id, locale)) });
    return { ok: true };
  }

  /** The link in the confirmation email. Returns false for a bad or expired link. */
  async confirm(id: string, token: string): Promise<boolean> {
    if (!this.valid(id, "confirm", token)) return false;
    const [row] = await this.db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id)).limit(1);
    if (!row) return false; // expired and deleted, or unsubscribed since
    if (!row.confirmedAt) {
      await this.db
        .update(newsletterSubscribers)
        .set({ confirmedAt: new Date(), noticeVersion: PRIVACY_NOTICE_VERSION })
        .where(eq(newsletterSubscribers.id, id));
    }
    return true;
  }

  /** The stop link in every weekly email: deletes the address. */
  async unsubscribe(id: string, token: string): Promise<boolean> {
    if (!this.valid(id, "stop", token)) return false;
    await this.db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return true;
  }

  // ----- the people's own data -----

  exportFor(email: string) {
    return this.db
      .select({
        email: newsletterSubscribers.email,
        locale: newsletterSubscribers.locale,
        createdAt: newsletterSubscribers.createdAt,
        confirmedAt: newsletterSubscribers.confirmedAt,
        noticeVersion: newsletterSubscribers.noticeVersion,
        lastSentWeek: newsletterSubscribers.lastSentWeek,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()));
  }

  async deleteFor(email: string) {
    await this.db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, email.toLowerCase()));
  }

  // ----- the weekly email -----

  /** Schemes added in the last 7 days, newest first. */
  async newSchemes(today = todayInIndia()) {
    const since = new Date(Date.parse(`${today}T00:00:00+05:30`) - 7 * DAY);
    return this.db
      .select()
      .from(schemes)
      .where(and(gte(schemes.createdAt, since), ne(schemes.status, "closed")))
      .orderBy(asc(schemes.name));
  }

  render(
    content: { newSchemes: (typeof schemes.$inferSelect)[] } & Awaited<ReturnType<DigestService["sharedContent"]>>,
    stopUrl: string,
    locale: Locale,
  ): Pick<Mail, "subject" | "text"> {
    const link = (path: string) => siteLink(this.mailer.siteUrl, locale, path);
    const T = tFor(locale).digest;
    const N = tFor(locale).newsletter;
    const L: string[] = [T.hi, "", N.intro];
    if (T.inEnglish) L.push(T.inEnglish);

    const list = content.newSchemes.map((s) => localizeScheme(s, locale));
    if (list.length) {
      L.push("", N.newSchemes, "");
      for (const s of list.slice(0, MAX_NEW)) L.push(`- ${s.name}: ${s.summary}`, `  ${link(`/schemes/${s.slug}`)}`);
      const more = list.length - MAX_NEW;
      if (more > 0) L.push(locale === "hi" ? `- और ${more} नई योजनाएँ: ${link("/schemes")}` : `- and ${more} more: ${link("/schemes")}`);
      L.push("", N.scan, link("/scan"));
    }
    if (content.deadlines.length) {
      L.push("", T.comingUp, "");
      for (const e of content.deadlines) {
        const when = e.deadline ? T.applyBy(shortDate(e.deadline, locale)) : T.starts(shortDate(e.startDate!, locale));
        L.push(`- ${e.name}: ${when}${e.city ? `, ${e.city}` : ""}${e.status === "To verify" ? T.unconfirmed : ""}`);
        if (e.sourceUrl) L.push(`  ${e.sourceUrl}`);
      }
    }
    if (content.policy.length) {
      L.push("", T.policyNews, "");
      for (const p of content.policy) L.push(`- ${p.headline} (${p.country})`, `  ${p.takeaway}`, `  ${p.sourceUrl}`);
    }
    if (content.guides.length) {
      L.push("", T.guides, "");
      for (const a of content.guides) L.push(`- ${a.title} (${T.minRead(a.readMinutes)})`, `  ${link(`/learn/${a.slug}`)}`);
    }
    L.push("", T.confirm, "", "--", N.why, T.stop(stopUrl), T.money);

    const bits = [
      list.length && (locale === "hi" ? `${list.length} नई योजनाएँ` : `${list.length} new ${list.length === 1 ? "scheme" : "schemes"}`),
      content.deadlines.length && T.deadlines(content.deadlines.length),
      content.policy.length && T.policy(content.policy.length),
    ].filter(Boolean);
    return { subject: bits.length ? `${T.subjectBase}: ${bits.join(", ")}` : T.subjectBase, text: L.join("\n") };
  }

  /** Send this week's email to confirmed subscribers and clear out unconfirmed sign-ups older than 7 days. */
  async run(today = todayInIndia()): Promise<NewsletterRunResult> {
    const week = weekOf(today);
    const cutoff = new Date(Date.now() - 7 * DAY);
    const expired = await this.db
      .delete(newsletterSubscribers)
      .where(and(isNull(newsletterSubscribers.confirmedAt), lt(newsletterSubscribers.createdAt, cutoff)))
      .returning({ id: newsletterSubscribers.id });

    const subs = await this.db.select().from(newsletterSubscribers).where(isNotNull(newsletterSubscribers.confirmedAt));
    const result: NewsletterRunResult = { weekOf: week, subscribers: subs.length, sent: 0, alreadySent: 0, nothingNew: 0, failed: 0, expired: expired.length };
    const [shared, fresh] = await Promise.all([this.digest.sharedContent(today), this.newSchemes(today)]);
    const content = { ...shared, newSchemes: fresh };
    if (fresh.length + shared.deadlines.length + shared.policy.length + shared.guides.length === 0) {
      result.nothingNew = subs.length;
      return result;
    }

    for (const sub of subs) {
      // Claim this week before sending so parallel runs can't double-send.
      const [claimed] = await this.db
        .update(newsletterSubscribers)
        .set({ lastSentWeek: week })
        .where(
          and(
            eq(newsletterSubscribers.id, sub.id),
            or(isNull(newsletterSubscribers.lastSentWeek), sql`${newsletterSubscribers.lastSentWeek} <> ${week}`),
          ),
        )
        .returning({ id: newsletterSubscribers.id });
      if (!claimed) {
        result.alreadySent++;
        continue;
      }
      const locale: Locale = sub.locale === "hi" ? "hi" : "en";
      try {
        const stop = `${this.mailer.siteUrl}/api/unsubscribe?s=${encodeURIComponent(sub.id)}&t=${this.token(sub.id, "stop")}`;
        await this.mailer.send({
          to: sub.email,
          ...this.render(content, this.stopUrl(sub.id, locale), locale),
          headers: { "List-Unsubscribe": `<${stop}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        });
        result.sent++;
        if (!this.mailer.isDev) await new Promise((r) => setTimeout(r, 600)); // stay under the provider's rate limit
      } catch (e) {
        await this.db.update(newsletterSubscribers).set({ lastSentWeek: sub.lastSentWeek }).where(eq(newsletterSubscribers.id, sub.id));
        result.failed++;
        this.log.error(`Weekly email to subscriber ${sub.id} failed: ${(e as Error).message}`);
      }
    }
    this.log.log(`Newsletter ${week}: ${JSON.stringify(result)}`);
    return result;
  }
}
