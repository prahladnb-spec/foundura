import { SkipThrottle } from "@nestjs/throttler";
import { Controller, Get, Inject, NotFoundException, Param, Query } from "@nestjs/common";
import { and, asc, desc, eq, gte, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { startupDirectoryQuerySchema } from "@foundura/shared";
import { parseBody, todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { articles, events, policyItems, schemes } from "../db/schema";
import { StartupsService } from "../startups/startups.service";
import { localizeScheme } from "../schemes/localize";

/** Public, read-only content used by the website (SEO pages). */
/** Public, cacheable reads. The web server caches these, so they are not rate limited per visitor. */
@SkipThrottle()
@Controller()
export class ContentController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
  ) {}

  @Get("schemes")
  async listSchemes(
    @Query("level") level?: string,
    @Query("state") state?: string,
    @Query("category") category?: string,
    @Query("lang") lang?: string,
  ) {
    const where: SQL[] = [];
    if (level) where.push(eq(schemes.level, level));
    if (state) where.push(eq(schemes.state, state));
    if (category) where.push(eq(schemes.category, category));
    const rows = await this.db
      .select()
      .from(schemes)
      .where(where.length ? and(...where) : undefined)
      .orderBy(asc(schemes.level), asc(schemes.name));
    return rows.map((s) => localizeScheme(s, lang === "hi" ? "hi" : "en"));
  }

  /** `?lang=hi` returns the Hindi text when a current translation exists; `contentLang` says which language came back. */
  @Get("schemes/:slug")
  async getScheme(@Param("slug") slug: string, @Query("lang") lang?: string) {
    const [s] = await this.db.select().from(schemes).where(eq(schemes.slug, slug)).limit(1);
    if (!s) throw new NotFoundException("Scheme not found.");
    return localizeScheme(s, lang === "hi" ? "hi" : "en");
  }

  @Get("policy")
  listPolicy(@Query("country") country?: string, @Query("impact") impact?: string) {
    const where: SQL[] = [];
    if (country) where.push(eq(policyItems.country, country));
    if (impact) where.push(eq(policyItems.impact, impact));
    return this.db
      .select()
      .from(policyItems)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(policyItems.date))
      .limit(100);
  }

  @Get("articles")
  listArticles() {
    return this.db
      .select({
        slug: articles.slug,
        title: articles.title,
        theme: articles.theme,
        excerpt: articles.excerpt,
        readMinutes: articles.readMinutes,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(isNotNull(articles.publishedAt))
      .orderBy(desc(articles.publishedAt));
  }

  @Get("articles/:slug")
  async getArticle(@Param("slug") slug: string) {
    const [a] = await this.db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!a || !a.publishedAt) throw new NotFoundException("Article not found.");
    return a;
  }

  /** The public startup showcase: only founders who chose a public profile, minus any an editor hid. */
  @Get("startups")
  listStartups(@Query() query: Record<string, string>) {
    const { sector, stage, state, lookingFor } = query;
    return this.startups.listPublic(parseBody(startupDirectoryQuerySchema, { sector, stage, state, lookingFor }));
  }

  @Get("startups/:slug")
  getPublicStartup(@Param("slug") slug: string) {
    return this.startups.getPublic(slug);
  }
}
