import { randomBytes } from "node:crypto";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { InvestorProfileInput } from "@foundura/shared";
import { and, arrayOverlaps, eq, inArray, sql } from "drizzle-orm";
import { slugify } from "../common/slug";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { introRequests, investors, type Investor } from "../db/schema";

export interface ResponseStats {
  received: number;
  responded: number;
  /** Shown only once an investor has received enough requests for the rate to mean something. */
  responseRatePct: number | null;
}

const MIN_FOR_RATE = 5;

export function investorPublicView(i: Investor, stats?: ResponseStats) {
  return {
    id: i.id,
    slug: i.slug,
    name: i.name,
    firm: i.firm,
    type: i.type,
    bio: i.bio,
    website: i.website,
    sectors: i.sectors,
    stages: i.stages,
    states: i.states,
    chequeMinInrLakh: i.chequeMinInrLakh,
    chequeMaxInrLakh: i.chequeMaxInrLakh,
    verified: i.verifiedAt !== null,
    ...(stats ? { responseRatePct: stats.responseRatePct } : {}),
  };
}

function columns(input: InvestorProfileInput) {
  return { ...input, firm: input.firm || null, bio: input.bio || null, website: input.website || null };
}

@Injectable()
export class InvestorsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async getMine(ownerId: string): Promise<Investor | null> {
    const [i] = await this.db.select().from(investors).where(eq(investors.ownerId, ownerId)).limit(1);
    return i ?? null;
  }

  async requireMine(ownerId: string): Promise<Investor> {
    const i = await this.getMine(ownerId);
    if (!i) throw new NotFoundException("Create your investor profile first.");
    return i;
  }

  async create(ownerId: string, input: InvestorProfileInput): Promise<Investor> {
    if (await this.getMine(ownerId)) throw new ConflictException("You already have an investor profile.");
    const slug = `${slugify(input.firm || input.name) || "investor"}-${randomBytes(3).toString("hex")}`;
    const [i] = await this.db.insert(investors).values({ ownerId, slug, ...columns(input) }).returning();
    return i;
  }

  async update(ownerId: string, input: InvestorProfileInput): Promise<Investor> {
    const mine = await this.requireMine(ownerId);
    const [i] = await this.db.update(investors).set(columns(input)).where(eq(investors.id, mine.id)).returning();
    return i;
  }

  async stats(ids: string[]): Promise<Map<string, ResponseStats>> {
    const out = new Map<string, ResponseStats>();
    if (ids.length === 0) return out;
    const rows = await this.db
      .select({
        investorId: introRequests.investorId,
        received: sql<number>`count(*) filter (where ${introRequests.status} <> 'withdrawn')`.mapWith(Number),
        responded: sql<number>`count(*) filter (where ${introRequests.status} in ('accepted','declined'))`.mapWith(Number),
      })
      .from(introRequests)
      .where(inArray(introRequests.investorId, ids))
      .groupBy(introRequests.investorId);
    for (const id of ids) {
      const r = rows.find((x) => x.investorId === id);
      const received = r?.received ?? 0;
      const responded = r?.responded ?? 0;
      out.set(id, {
        received,
        responded,
        responseRatePct: received >= MIN_FOR_RATE ? Math.round((responded / received) * 100) : null,
      });
    }
    return out;
  }

  /** Listed investors, optionally filtered. */
  async listListed(filter: { sector?: string; stage?: string } = {}): Promise<Investor[]> {
    const where = [eq(investors.isListed, true)];
    if (filter.sector) where.push(arrayOverlaps(investors.sectors, [filter.sector]));
    if (filter.stage) where.push(arrayOverlaps(investors.stages, [filter.stage]));
    return this.db.select().from(investors).where(and(...where));
  }

  async getListedBySlug(slug: string) {
    const [i] = await this.db.select().from(investors).where(eq(investors.slug, slug)).limit(1);
    if (!i || !i.isListed) throw new NotFoundException("Investor not found.");
    const stats = await this.stats([i.id]);
    return investorPublicView(i, stats.get(i.id));
  }
}
