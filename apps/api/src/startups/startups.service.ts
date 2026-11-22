import { randomBytes } from "node:crypto";
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ScanInput, StartupDirectoryQuery, StartupProfileInput } from "@foundura/shared";
import { and, arrayOverlaps, desc, eq, isNull, type SQL } from "drizzle-orm";
import { slugify } from "../common/slug";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { startups, type Startup } from "../db/schema";

/**
 * Columns that are safe to show on a public profile: no turnover, funding, raise or ownership
 * figures, no deck link, and only the year of incorporation.
 */
export function publicView(s: Startup) {
  return {
    name: s.name,
    slug: s.slug,
    oneLiner: s.oneLiner,
    description: s.description,
    website: s.website,
    productUrl: s.productUrl,
    lookingFor: s.lookingFor,
    state: s.state,
    sectors: s.sectors,
    stage: s.stage,
    foundedYear: s.incorporationDate ? Number(s.incorporationDate.slice(0, 4)) : null,
    dpiitRecognised: s.dpiitRecognised,
    isDeepTech: s.isDeepTech,
    updatedAt: s.updatedAt,
  };
}
export type StartupPublic = ReturnType<typeof publicView>;

/** On the public showcase: the founder made it public and no editor has hidden it. */
const onShowcase = () => and(eq(startups.isPublic, true), isNull(startups.showcaseHiddenAt))!;

export function toScanInput(s: Startup): ScanInput {
  const v = <T>(x: T | null): T | undefined => (x === null ? undefined : x);
  return {
    entityType: v(s.entityType) as ScanInput["entityType"],
    incorporationDate: v(s.incorporationDate),
    turnoverInrCr: v(s.turnoverInrCr),
    dpiitRecognised: v(s.dpiitRecognised),
    state: v(s.state) as ScanInput["state"],
    sectors: s.sectors as ScanInput["sectors"],
    stage: v(s.stage) as ScanInput["stage"],
    isDeepTech: v(s.isDeepTech),
    womenLed: v(s.womenLed),
    govtSupportReceivedInrLakh: v(s.govtSupportReceivedInrLakh),
    indianPromoterSharePct: v(s.indianPromoterSharePct),
  };
}

function toColumns(input: Partial<StartupProfileInput>) {
  const { website, productUrl, sectors, lookingFor, investorDocs, ...rest } = input;
  return {
    ...rest,
    ...(website !== undefined ? { website: website || null } : {}),
    ...(productUrl !== undefined ? { productUrl: productUrl || null } : {}),
    ...(sectors !== undefined ? { sectors } : {}),
    ...(lookingFor !== undefined ? { lookingFor } : {}),
    ...(investorDocs !== undefined ? { investorDocs: [...new Set(investorDocs)] } : {}),
  };
}

@Injectable()
export class StartupsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  listMine(ownerId: string) {
    return this.db.select().from(startups).where(eq(startups.ownerId, ownerId));
  }

  async getMine(ownerId: string, id: string): Promise<Startup> {
    const [s] = await this.db.select().from(startups).where(eq(startups.id, id)).limit(1);
    if (!s) throw new NotFoundException("Startup not found.");
    if (s.ownerId !== ownerId) throw new ForbiddenException();
    return s;
  }

  async create(ownerId: string, input: StartupProfileInput): Promise<Startup> {
    const base = slugify(input.name) || "startup";
    const slug = `${base}-${randomBytes(3).toString("hex")}`;
    const [s] = await this.db
      .insert(startups)
      .values({ ownerId, slug, ...toColumns(input), name: input.name })
      .returning();
    return s;
  }

  async update(ownerId: string, id: string, input: Partial<StartupProfileInput>): Promise<Startup> {
    await this.getMine(ownerId, id);
    const [s] = await this.db
      .update(startups)
      .set(toColumns(input))
      .where(and(eq(startups.id, id), eq(startups.ownerId, ownerId)))
      .returning();
    return s;
  }

  async remove(ownerId: string, id: string) {
    await this.getMine(ownerId, id);
    await this.db.delete(startups).where(and(eq(startups.id, id), eq(startups.ownerId, ownerId)));
  }

  async getPublic(slug: string): Promise<StartupPublic> {
    const [s] = await this.db.select().from(startups).where(and(eq(startups.slug, slug), onShowcase())).limit(1);
    if (!s) throw new NotFoundException("Startup not found.");
    return publicView(s);
  }

  /** The public showcase, most recently updated first. */
  async listPublic(filter: StartupDirectoryQuery = {}): Promise<StartupPublic[]> {
    const where: SQL[] = [onShowcase()];
    if (filter.sector) where.push(arrayOverlaps(startups.sectors, [filter.sector]));
    if (filter.lookingFor) where.push(arrayOverlaps(startups.lookingFor, [filter.lookingFor]));
    if (filter.stage) where.push(eq(startups.stage, filter.stage));
    if (filter.state) where.push(eq(startups.state, filter.state));
    const rows = await this.db.select().from(startups).where(and(...where)).orderBy(desc(startups.updatedAt)).limit(500);
    return rows.map(publicView);
  }
}
