import {
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
import { articleSchema, conditionSchema, readMinutes, schemeEditSchema, stateSchema } from "@foundura/shared";
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

  // ----- schemes -----

  @Get("schemes")
  listSchemes() {
    return this.db
      .select({
        slug: schemes.slug,
        name: schemes.name,
        level: schemes.level,
        state: schemes.state,
        category: schemes.category,
        status: schemes.status,
        lastVerifiedAt: schemes.lastVerifiedAt,
        updatedAt: schemes.updatedAt,
      })
      .from(schemes)
      .orderBy(asc(schemes.lastVerifiedAt), asc(schemes.name));
  }

  @Get("schemes/:slug")
  async getScheme(@Param("slug") slug: string) {
    const [s] = await this.db.select().from(schemes).where(eq(schemes.slug, slug)).limit(1);
    if (!s) throw new NotFoundException();
    return s;
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
