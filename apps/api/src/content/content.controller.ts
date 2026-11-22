import { Controller, Get, Inject, NotFoundException, Param, Query } from "@nestjs/common";
import { and, asc, desc, eq, gte, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { articles, events, policyItems, schemes } from "../db/schema";
import { StartupsService } from "../startups/startups.service";

/** Public, read-only content used by the website (SEO pages). */
@Controller()
export class ContentController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
  ) {}

  @Get("schemes")
  listSchemes(@Query("level") level?: string, @Query("state") state?: string, @Query("category") category?: string) {
    const where: SQL[] = [];
    if (level) where.push(eq(schemes.level, level));
    if (state) where.push(eq(schemes.state, state));
    if (category) where.push(eq(schemes.category, category));
    return this.db
      .select()
      .from(schemes)
      .where(where.length ? and(...where) : undefined)
      .orderBy(asc(schemes.level), asc(schemes.name));
  }

  @Get("schemes/:slug")
  async getScheme(@Param("slug") slug: string) {
    const [s] = await this.db.select().from(schemes).where(eq(schemes.slug, slug)).limit(1);
    if (!s) throw new NotFoundException("Scheme not found.");
    return s;
  }

  /** Upcoming events by default; `?all=1` includes past ones. */
  @Get("events")
  listEvents(@Query("scope") scope?: string, @Query("type") type?: string, @Query("all") all?: string) {
    const today = todayInIndia();
    const where: SQL[] = [];
    if (scope) where.push(eq(events.scope, scope));
    if (type) where.push(eq(events.type, type));
    if (!all) {
      where.push(
        or(
          gte(events.endDate, today),
          and(isNull(events.endDate), gte(events.startDate, today)),
          and(isNull(events.startDate), isNotNull(events.deadline), gte(events.deadline, today)),
        )!,
      );
    }
    return this.db
      .select()
      .from(events)
      .where(and(...where))
      .orderBy(asc(events.startDate), asc(events.deadline));
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

  @Get("startups/:slug")
  getPublicStartup(@Param("slug") slug: string) {
    return this.startups.getPublic(slug);
  }

  @Get("health")
  health() {
    return { ok: true, date: todayInIndia() };
  }
}
