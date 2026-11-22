import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  articleSchema,
  type Condition,
  conditionSchema,
  readMinutes,
  schemeEditSchema,
  schemeTranslationSchema,
  stateSchema,
  visibleConditionLabels,
} from "@foundura/shared";
import { englishFingerprint, translationStatus } from "../schemes/localize";
import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { parseBody, todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { articles, events, introRequests, investors, policyItems, schemes, startups, users } from "../db/schema";
import { Admin, type AdminActor, AdminGuard } from "./admin.guard";
import { AuditService } from "./audit.service";

const schemeSaveSchema = schemeEditSchema.extend({ markVerified: z.boolean().default(false) });

const schemeCreateSchema = schemeEditSchema.extend({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  level: z.enum(["national", "state"]),
  state: stateSchema.nullable(),
  category: z.enum(["recognition", "tax", "grant", "loan", "fund", "ipr", "procurement", "regulatory", "state_policy"]),
}).refine((v) => (v.level === "state") === (v.state !== null), {
  message: "State schemes need a state; national schemes must not have one",
  path: ["state"],
});

const count = (q: Promise<{ n: number }[]>) => q.then((r) => r[0]?.n ?? 0);
const n = sql<number>`count(*)`.mapWith(Number);

/** Admin console API. Every change is written to the audit log. */
@Controller("admin")
@UseGuards(AdminGuard)
export class AdminConsoleController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get("overview")
  async overview() {
    const [usersN, startupsN, publicStartups, investorsN, unverifiedInvestors, schemesN, unverifiedSchemes, eventsN, policyN, articlesN, drafts] =
      await Promise.all([
        count(this.db.select({ n }).from(users)),
        count(this.db.select({ n }).from(startups)),
        count(this.db.select({ n }).from(startups).where(eq(startups.isPublic, true))),
        count(this.db.select({ n }).from(investors)),
        count(this.db.select({ n }).from(investors).where(isNull(investors.verifiedAt))),
        count(this.db.select({ n }).from(schemes)),
        count(this.db.select({ n }).from(schemes).where(isNull(schemes.lastVerifiedAt))),
        count(this.db.select({ n }).from(events)),
        count(this.db.select({ n }).from(policyItems)),
        count(this.db.select({ n }).from(articles)),
        count(this.db.select({ n }).from(articles).where(isNull(articles.publishedAt))),
      ]);
    const intros = await this.db.select({ status: introRequests.status, n }).from(introRequests).groupBy(introRequests.status);
    return {
      users: usersN,
      startups: startupsN,
      publicStartups,
      investors: investorsN,
      unverifiedInvestors,
      schemes: schemesN,
      unverifiedSchemes,
      events: eventsN,
      policyItems: policyN,
      articles: articlesN,
      draftArticles: drafts,
      intros: Object.fromEntries(intros.map((r) => [r.status, r.n])),
    };
  }

  // ----- investors -----

  @Get("investors")
  listInvestors() {
    return this.db
      .select({
        id: investors.id,
        slug: investors.slug,
        name: investors.name,
        firm: investors.firm,
        type: investors.type,
        website: investors.website,
        isListed: investors.isListed,
        verifiedAt: investors.verifiedAt,
        createdAt: investors.createdAt,
        email: users.email,
      })
      .from(investors)
      .innerJoin(users, eq(users.id, investors.ownerId))
      .orderBy(asc(investors.verifiedAt), desc(investors.createdAt));
  }

  @Post("investors/:id/verify")
  @HttpCode(200)
  async verifyInvestor(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const { verified } = parseBody(z.object({ verified: z.boolean() }), body);
    const [row] = await this.db
      .update(investors)
      .set({ verifiedAt: verified ? new Date() : null })
      .where(eq(investors.id, id))
      .returning({ id: investors.id, verifiedAt: investors.verifiedAt });
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, verified ? "investor.verify" : "investor.unverify", "investor", id);
    return row;
  }

  @Post("investors/:id/listing")
  @HttpCode(200)
  async setListing(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const { isListed } = parseBody(z.object({ isListed: z.boolean() }), body);
    const [row] = await this.db
      .update(investors)
      .set({ isListed })
      .where(eq(investors.id, id))
      .returning({ id: investors.id, isListed: investors.isListed });
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, isListed ? "investor.list" : "investor.unlist", "investor", id);
    return row;
  }

  // ----- startup showcase -----

  /** Startups whose founders chose a public profile, newest first, including any hidden by an editor. */
  @Get("startups")
  listShowcase() {
    return this.db
      .select({
        id: startups.id,
        slug: startups.slug,
        name: startups.name,
        oneLiner: startups.oneLiner,
        website: startups.website,
        productUrl: startups.productUrl,
        showcaseHiddenAt: startups.showcaseHiddenAt,
        updatedAt: startups.updatedAt,
        email: users.email,
      })
      .from(startups)
      .innerJoin(users, eq(users.id, startups.ownerId))
      .where(eq(startups.isPublic, true))
      .orderBy(desc(startups.updatedAt));
  }

  /** Hide a startup from the public showcase (or show it again). The founder's own setting is untouched. */
  @Post("startups/:id/showcase")
  @HttpCode(200)
  async setShowcase(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const { hidden } = parseBody(z.object({ hidden: z.boolean() }), body);
    const [row] = await this.db
      .update(startups)
      .set({ showcaseHiddenAt: hidden ? new Date() : null })
      .where(eq(startups.id, id))
      .returning({ id: startups.id, showcaseHiddenAt: startups.showcaseHiddenAt });
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, hidden ? "startup.hide" : "startup.show", "startup", id);
    return row;
  }

  // ----- schemes -----

  @Get("schemes")
  async listSchemes() {
    const rows = await this.db.select().from(schemes).orderBy(asc(schemes.lastVerifiedAt), asc(schemes.name));
    return rows.map((s) => ({
      slug: s.slug,
      name: s.name,
      level: s.level,
      state: s.state,
      category: s.category,
      status: s.status,
      lastVerifiedAt: s.lastVerifiedAt,
      updatedAt: s.updatedAt,
      hiStatus: translationStatus(s, "hi"),
    }));
  }

  /** The scheme, plus the Hindi translation's status and the condition labels it must cover. */
  @Get("schemes/:slug")
  async getScheme(@Param("slug") slug: string) {
    const [s] = await this.db.select().from(schemes).where(eq(schemes.slug, slug)).limit(1);
    if (!s) throw new NotFoundException();
    return { ...s, hi: { status: translationStatus(s, "hi"), labels: visibleConditionLabels(s.rule as Condition) } };
  }

  /**
   * Save the Hindi text. It must translate every visible condition label; it is stamped with a
   * fingerprint of the current English so later English edits mark it out of date.
   */
  @Put("schemes/:slug/translations/hi")
  async saveHindi(@Admin() actor: AdminActor, @Param("slug") slug: string, @Body() body: unknown) {
    const input = parseBody(schemeTranslationSchema, body);
    const [s] = await this.db.select().from(schemes).where(eq(schemes.slug, slug)).limit(1);
    if (!s) throw new NotFoundException();
    const needed = visibleConditionLabels(s.rule as Condition);
    const missing = needed.filter((l) => !input.labels[l]?.trim());
    if (missing.length) {
      throw new BadRequestException({ message: `Translate every condition: ${missing.length} missing.`, missing });
    }
    const labels = Object.fromEntries(needed.map((l) => [l, input.labels[l].trim()]));
    const hi = { ...input, labels, sourceHash: englishFingerprint(s), updatedAt: new Date().toISOString() };
    await this.db
      .update(schemes)
      .set({ translations: { ...s.translations, hi } })
      .where(eq(schemes.slug, slug));
    await this.audit.record(actor, "scheme.translate_hi", "scheme", slug);
    return { status: "current" as const };
  }

  /**
   * Save edits. Any edit clears the verified date unless the editor confirms, in the same save,
   * that they checked the scheme against its official source today.
   */
  @Put("schemes/:slug")
  async saveScheme(@Admin() actor: AdminActor, @Param("slug") slug: string, @Body() body: unknown) {
    const { markVerified, ...input } = parseBody(schemeSaveSchema, body);
    const [row] = await this.db
      .update(schemes)
      .set({ ...input, lastVerifiedAt: markVerified ? todayInIndia() : null })
      .where(eq(schemes.slug, slug))
      .returning();
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, markVerified ? "scheme.edit_verify" : "scheme.edit", "scheme", slug, {
      status: input.status,
    });
    return row;
  }

  @Post("schemes/:slug/verify")
  @HttpCode(200)
  async verifyScheme(@Admin() actor: AdminActor, @Param("slug") slug: string) {
    const [row] = await this.db
      .update(schemes)
      .set({ lastVerifiedAt: todayInIndia() })
      .where(eq(schemes.slug, slug))
      .returning({ slug: schemes.slug, lastVerifiedAt: schemes.lastVerifiedAt });
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, "scheme.verify", "scheme", slug);
    return row;
  }

  @Post("schemes")
  async createScheme(@Admin() actor: AdminActor, @Body() body: unknown) {
    const input = parseBody(schemeCreateSchema, body);
    const [exists] = await this.db.select({ slug: schemes.slug }).from(schemes).where(eq(schemes.slug, input.slug));
    if (exists) throw new ConflictException("A scheme with that slug already exists.");
    const [row] = await this.db.insert(schemes).values({ ...input, lastVerifiedAt: null }).returning();
    await this.audit.record(actor, "scheme.create", "scheme", input.slug);
    return row;
  }

  /** Validate a rule without saving (used by the editor's "Check rule" button). */
  @Post("rules/validate")
  @HttpCode(200)
  validateRule(@Body() body: unknown) {
    const r = conditionSchema.safeParse(body);
    return r.success
      ? { ok: true }
      : { ok: false, issues: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) };
  }

  // ----- articles -----

  @Get("articles")
  listArticles() {
    return this.db
      .select({
        slug: articles.slug,
        title: articles.title,
        theme: articles.theme,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .orderBy(desc(articles.updatedAt));
  }

  @Get("articles/:slug")
  async getArticle(@Param("slug") slug: string) {
    const [a] = await this.db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!a) throw new NotFoundException();
    return a;
  }

  @Post("articles")
  async createArticle(@Admin() actor: AdminActor, @Body() body: unknown) {
    const input = parseBody(articleSchema, body);
    const [exists] = await this.db.select({ slug: articles.slug }).from(articles).where(eq(articles.slug, input.slug));
    if (exists) throw new ConflictException("An article with that slug already exists.");
    const [row] = await this.db
      .insert(articles)
      .values({ ...input, readMinutes: readMinutes(input.body) })
      .returning();
    await this.audit.record(actor, input.publishedAt ? "article.publish" : "article.draft", "article", input.slug);
    return row;
  }

  @Put("articles/:slug")
  async saveArticle(@Admin() actor: AdminActor, @Param("slug") slug: string, @Body() body: unknown) {
    const input = parseBody(articleSchema, body);
    if (input.slug !== slug) {
      const [taken] = await this.db.select({ slug: articles.slug }).from(articles).where(eq(articles.slug, input.slug));
      if (taken) throw new ConflictException("An article with that slug already exists.");
    }
    const [row] = await this.db
      .update(articles)
      .set({ ...input, readMinutes: readMinutes(input.body) })
      .where(eq(articles.slug, slug))
      .returning();
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, input.publishedAt ? "article.publish" : "article.edit", "article", input.slug);
    return row;
  }

  // ----- audit -----

  @Get("audit")
  auditLog() {
    return this.audit.recent(200);
  }
}
