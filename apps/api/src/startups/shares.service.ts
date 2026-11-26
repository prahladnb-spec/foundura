import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { JOURNEY, type JourneyStage, readiness, type ShareLinkInput } from "@foundura/shared";
import { and, eq, lt } from "drizzle-orm";
import { ConsentService } from "../consent/consent.service";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { profileShares, startups } from "../db/schema";
import { publicView, StartupsService } from "./startups.service";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const DAY = 24 * 60 * 60 * 1000;

/**
 * Private profile links. A founder makes one link per startup and sends it to an incubator or
 * investor; it shows the public profile fields (never turnover, funding, raise, deck or shareholding),
 * plus the readiness score and progress if the founder chose to include them.
 */
@Injectable()
export class SharesService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
    @Inject(ConsentService) private readonly consents: ConsentService,
  ) {}

  private sweep() {
    return this.db.delete(profileShares).where(lt(profileShares.expiresAt, new Date()));
  }

  private view(row: typeof profileShares.$inferSelect) {
    return { showReadiness: row.showReadiness, showProgress: row.showProgress, createdAt: row.createdAt, expiresAt: row.expiresAt };
  }

  async current(ownerId: string, startupId: string) {
    await this.startups.getMine(ownerId, startupId);
    const [row] = await this.db.select().from(profileShares).where(eq(profileShares.startupId, startupId)).limit(1);
    return { active: row && row.expiresAt > new Date() ? this.view(row) : null };
  }

  /** Makes a new link, replacing any old one. The token is returned once and only its hash is kept. */
  async create(ownerId: string, startupId: string, input: ShareLinkInput) {
    await this.startups.getMine(ownerId, startupId);
    await this.sweep();
    const token = randomBytes(32).toString("base64url");
    const values = {
      startupId,
      tokenHash: hash(token),
      showReadiness: input.showReadiness,
      showProgress: input.showProgress,
      expiresAt: new Date(Date.now() + input.days * DAY),
    };
    const [row] = await this.db
      .insert(profileShares)
      .values(values)
      .onConflictDoUpdate({ target: profileShares.startupId, set: { ...values, createdAt: new Date() } })
      .returning();
    return { token, active: this.view(row) };
  }

  async remove(ownerId: string, startupId: string) {
    await this.startups.getMine(ownerId, startupId);
    await this.db.delete(profileShares).where(eq(profileShares.startupId, startupId));
  }

  /** For the data export: the link's settings and dates, never the token. */
  async exportFor(startupIds: string[]) {
    if (!startupIds.length) return [];
    const rows = await Promise.all(startupIds.map((id) => this.db.select().from(profileShares).where(eq(profileShares.startupId, id))));
    return rows.flat().map((r) => ({ startupId: r.startupId, ...this.view(r) }));
  }

  /** What the person holding the link sees. */
  async open(token: string) {
    await this.sweep();
    const [row] = await this.db
      .select({ share: profileShares, startup: startups })
      .from(profileShares)
      .innerJoin(startups, eq(startups.id, profileShares.startupId))
      .where(and(eq(profileShares.tokenHash, hash(token))))
      .limit(1);
    if (!row || row.share.expiresAt <= new Date()) throw new NotFoundException("This link has expired or been switched off.");
    const s = row.startup;
    let score: { score: number; band: string } | null = null;
    if (row.share.showReadiness) {
      const r = readiness({ ...s, investorVisibility: await this.consents.isGranted(s.ownerId, "investor_visibility") });
      score = { score: r.score, band: r.band };
    }
    let progress: { stage: JourneyStage | null; done: string[] } | null = null;
    if (row.share.showProgress) {
      const stage = s.journeyStage && s.journeyStage in JOURNEY ? (s.journeyStage as JourneyStage) : null;
      progress = { stage, done: s.journeyDone };
    }
    return { startup: publicView(s), readiness: score, progress, expiresAt: row.share.expiresAt };
  }
}
