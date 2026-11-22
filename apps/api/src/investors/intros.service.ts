import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  matchScore,
  MAX_PENDING_INTROS,
  MIN_MATCH_FOR_INTRO,
  MIN_READINESS_FOR_INTRO,
  readiness,
} from "@foundura/shared";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { ConsentService } from "../consent/consent.service";
import { MailerService } from "../mail/mailer.service";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { introRequests, investors, startups, users, type Investor, type Startup } from "../db/schema";
import { publicView, StartupsService } from "../startups/startups.service";
import { InvestorsService, investorPublicView } from "./investors.service";

const toMatchStartup = (s: Startup) => ({
  sectors: s.sectors,
  stage: s.stage,
  state: s.state,
  raisingInrLakh: s.raisingInrLakh,
});

@Injectable()
export class IntrosService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
    @Inject(InvestorsService) private readonly investorsSvc: InvestorsService,
    @Inject(ConsentService) private readonly consents: ConsentService,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  private async emailOf(userId: string): Promise<string | null> {
    const [u] = await this.db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    return u?.email ?? null;
  }

  async readinessFor(ownerId: string, startupId: string) {
    const s = await this.startups.getMine(ownerId, startupId);
    return readiness({ ...s, investorVisibility: await this.consents.isGranted(ownerId, "investor_visibility") });
  }

  /** Investors ranked for a founder's startup, with reasons and any existing intro status. */
  async investorMatches(ownerId: string, startupId: string) {
    const s = await this.startups.getMine(ownerId, startupId);
    const list = (await this.investorsSvc.listListed()).filter((i) => i.ownerId !== ownerId);
    const stats = await this.investorsSvc.stats(list.map((i) => i.id));
    const existing = await this.db
      .select({ investorId: introRequests.investorId, status: introRequests.status })
      .from(introRequests)
      .where(eq(introRequests.startupId, s.id))
      .orderBy(desc(introRequests.createdAt));
    return list
      .map((i) => ({
        investor: investorPublicView(i, stats.get(i.id)),
        match: matchScore(toMatchStartup(s), i),
        introStatus: existing.find((e) => e.investorId === i.id)?.status ?? null,
      }))
      .sort((a, b) => b.match.score - a.match.score || a.investor.name.localeCompare(b.investor.name));
  }

  async request(ownerId: string, startupId: string, investorId: string, message: string) {
    const s = await this.startups.getMine(ownerId, startupId);
    const [inv] = await this.db.select().from(investors).where(eq(investors.id, investorId)).limit(1);
    if (!inv || !inv.isListed) throw new NotFoundException("Investor not found.");
    if (inv.ownerId === ownerId) throw new BadRequestException("You can't request an intro to yourself.");

    const r = readiness({ ...s, investorVisibility: await this.consents.isGranted(ownerId, "investor_visibility") });
    if (r.score < MIN_READINESS_FOR_INTRO) {
      throw new ForbiddenException(
        `Reach a readiness score of ${MIN_READINESS_FOR_INTRO} before requesting intros (you're at ${r.score}). The fix list shows what to add.`,
      );
    }
    const m = matchScore(toMatchStartup(s), inv);
    if (m.score < MIN_MATCH_FOR_INTRO) {
      throw new ForbiddenException("This investor's focus doesn't match your startup closely enough for an intro.");
    }

    const open = await this.db
      .select({ investorId: introRequests.investorId, status: introRequests.status })
      .from(introRequests)
      .where(and(eq(introRequests.startupId, s.id), inArray(introRequests.status, ["pending", "accepted"])));
    if (open.some((o) => o.investorId === inv.id)) throw new ConflictException("You already have an intro with this investor.");
    if (open.filter((o) => o.status === "pending").length >= MAX_PENDING_INTROS) {
      throw new ForbiddenException(`You can have up to ${MAX_PENDING_INTROS} open requests. Wait for replies or withdraw one.`);
    }

    const [row] = await this.db
      .insert(introRequests)
      .values({ startupId: s.id, investorId: inv.id, message, matchScore: m.score })
      .returning();

    // Notify the investor. Only the startup's name goes in the email; details stay on Foundura.
    const to = await this.emailOf(inv.ownerId);
    if (to) {
      this.mailer.notify({
        to,
        subject: `New intro request from ${s.name} (${m.score}% match)`,
        text: `${s.name} would like an introduction.\n\nRead their message and decide on Foundura: ${this.mailer.siteUrl}/dashboard/investor\n\nYour email is shared only if you accept.`,
      });
    }
    return row;
  }

  /** Requests the user sent (as founder) and received (as investor). Emails appear only once accepted. */
  async listForUser(userId: string) {
    const mine = await this.startups.listMine(userId);
    const inv = await this.investorsSvc.getMine(userId);

    const sentRows = mine.length
      ? await this.db
          .select({ intro: introRequests, investor: investors, email: users.email })
          .from(introRequests)
          .innerJoin(investors, eq(investors.id, introRequests.investorId))
          .innerJoin(users, eq(users.id, investors.ownerId))
          .where(inArray(introRequests.startupId, mine.map((s) => s.id)))
          .orderBy(desc(introRequests.createdAt))
      : [];

    const receivedRows = inv
      ? await this.db
          .select({ intro: introRequests, startup: startups, email: users.email })
          .from(introRequests)
          .innerJoin(startups, eq(startups.id, introRequests.startupId))
          .innerJoin(users, eq(users.id, startups.ownerId))
          .where(and(eq(introRequests.investorId, inv.id), sql`${introRequests.status} <> 'withdrawn'`))
          .orderBy(desc(introRequests.createdAt))
      : [];

    return {
      sent: sentRows.map(({ intro, investor, email }) => ({
        id: intro.id,
        status: intro.status,
        message: intro.message,
        matchScore: intro.matchScore,
        createdAt: intro.createdAt,
        respondedAt: intro.respondedAt,
        startupName: mine.find((s) => s.id === intro.startupId)?.name ?? "",
        investor: investorPublicView(investor),
        contactEmail: intro.status === "accepted" ? email : null,
      })),
      received: receivedRows.map(({ intro, startup, email }) => ({
        id: intro.id,
        status: intro.status,
        message: intro.message,
        matchScore: intro.matchScore,
        createdAt: intro.createdAt,
        respondedAt: intro.respondedAt,
        startup: {
          ...publicView(startup),
          // Shared with the investor because the founder chose to send this request.
          deckUrl: startup.deckUrl,
          raisingInrLakh: startup.raisingInrLakh,
        },
        contactEmail: intro.status === "accepted" ? email : null,
      })),
    };
  }

  async respond(userId: string, introId: string, accept: boolean) {
    const inv = await this.investorsSvc.requireMine(userId);
    const [intro] = await this.db.select().from(introRequests).where(eq(introRequests.id, introId)).limit(1);
    if (!intro || intro.investorId !== inv.id) throw new NotFoundException("Request not found.");
    if (intro.status !== "pending") throw new ConflictException("This request has already been answered.");
    await this.db
      .update(introRequests)
      .set({ status: accept ? "accepted" : "declined", respondedAt: new Date() })
      .where(eq(introRequests.id, intro.id));

    const [st] = await this.db.select().from(startups).where(eq(startups.id, intro.startupId)).limit(1);
    const to = st ? await this.emailOf(st.ownerId) : null;
    if (to) {
      const who = inv.firm ?? inv.name;
      this.mailer.notify(
        accept
          ? {
              to,
              subject: `${who} accepted your intro request`,
              text: `Good news: ${who} accepted your intro request for ${st!.name}. Their contact email is now on your dashboard: ${this.mailer.siteUrl}/dashboard`,
            }
          : {
              to,
              subject: `Update on your intro request to ${who}`,
              text: `${who} has decided not to take your intro request for ${st!.name} forward. Your other matches are on your dashboard: ${this.mailer.siteUrl}/dashboard`,
            },
      );
    }
    return { id: intro.id, status: accept ? "accepted" : "declined" };
  }

  async withdraw(userId: string, introId: string) {
    const [intro] = await this.db.select().from(introRequests).where(eq(introRequests.id, introId)).limit(1);
    if (!intro) throw new NotFoundException("Request not found.");
    await this.startups.getMine(userId, intro.startupId); // ownership check
    if (intro.status !== "pending") throw new ConflictException("Only pending requests can be withdrawn.");
    await this.db.update(introRequests).set({ status: "withdrawn" }).where(eq(introRequests.id, intro.id));
    return { id: intro.id, status: "withdrawn" };
  }

  /**
   * Startups an investor matches with. Only startups whose founders made the profile public
   * AND switched on "Show my profile to investors" are included (consent-gated).
   */
  async startupMatches(userId: string) {
    const inv = await this.investorsSvc.requireMine(userId);
    const visible = await this.db.execute<{ user_id: string }>(sql`
      select user_id from (
        select distinct on (user_id) user_id, granted
        from consents where purpose = 'investor_visibility'
        order by user_id, created_at desc
      ) latest where granted = true
    `);
    const ownerIds = visible.rows.map((r) => r.user_id).filter((id) => id !== userId);
    if (ownerIds.length === 0) return [];
    const list = await this.db
      .select()
      .from(startups)
      .where(and(eq(startups.isPublic, true), inArray(startups.ownerId, ownerIds)));
    return list
      .map((s) => ({ startup: publicView(s), match: matchScore(toMatchStartup(s), inv) }))
      .filter((x) => x.match.score >= MIN_MATCH_FOR_INTRO)
      .sort((a, b) => b.match.score - a.match.score);
  }

  /** For data export. */
  async exportFor(userId: string, inv: Investor | null) {
    const mine = await this.startups.listMine(userId);
    const sent = mine.length
      ? await this.db.select().from(introRequests).where(inArray(introRequests.startupId, mine.map((s) => s.id)))
      : [];
    const received = inv ? await this.db.select().from(introRequests).where(eq(introRequests.investorId, inv.id)) : [];
    return { sent, received };
  }
}
