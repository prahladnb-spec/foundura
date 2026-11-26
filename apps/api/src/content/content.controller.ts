import { SkipThrottle } from "@nestjs/throttler";
import { Controller, Get, Inject, NotFoundException, Param, Query } from "@nestjs/common";
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import { startupDirectoryQuerySchema } from "@foundura/shared";
import { parseBody, todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { articles, dailyCounts, events, policyItems, schemes } from "../db/schema";
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
        topic: articles.topic,
        authorName: articles.authorName,
      })
      .from(articles)
      .where(isNotNull(articles.publishedAt))
      .orderBy(desc(articles.publishedAt));
  }

  /**
   * The most-read guides over the last 30 days, from the anonymous daily page-view totals (every
   * language counts towards the same guide). Nothing about any reader is involved.
   */
  @Get("articles/popular")
  async popularArticles() {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const rows = await this.db
      .select({ key: dailyCounts.key, n: sql<number>`sum(${dailyCounts.count})::int` })
      .from(dailyCounts)
      .where(and(eq(dailyCounts.metric, "page_view"), gte(dailyCounts.day, since), sql`${dailyCounts.key} ~ '^(/[a-z]{2})?/learn/[a-z0-9-]+$'`))
      .groupBy(dailyCounts.key);
    const views = new Map<string, number>();
    for (const r of rows) {
      const slug = r.key.split("/").pop()!;
      views.set(slug, (views.get(slug) ?? 0) + r.n);
    }
    if (!views.size) return [];
    const published = await this.db
      .select({ slug: articles.slug, title: articles.title, readMinutes: articles.readMinutes })
      .from(articles)
      .where(and(isNotNull(articles.publishedAt), inArray(articles.slug, [...views.keys()])));
    return published
      .map((a) => ({ ...a, views: views.get(a.slug) ?? 0 }))
      .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title))
      .slice(0, 5);
  }

  /**
   * Public totals for "Foundura in numbers": a few anonymous usage counts over the last 30 days.
   * Daily totals only; nothing here can identify anyone.
   */
  @Get("stats/usage")
  async usageStats() {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const shown = ["scan_run", "template_download", "calendar_add", "signup"] as const;
    const rows = await this.db
      .select({ metric: dailyCounts.metric, n: sql<number>`sum(${dailyCounts.count})::int` })
      .from(dailyCounts)
      .where(and(gte(dailyCounts.day, since), inArray(dailyCounts.metric, [...shown])))
      .groupBy(dailyCounts.metric);
    return { since, totals: Object.fromEntries(shown.map((m) => [m, rows.find((r) => r.metric === m)?.n ?? 0])) };
  }

  @Get("articles/:slug")
  async getArticle(@Param("slug") slug: string) {
    const [a] = await this.db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!a || !a.publishedAt) throw new NotFoundException("Article not found.");
    const { authorConsentAt: _consent, ...pub } = a;
    return pub;
  }

  /** The public startup showcase: only founders who chose a public profile, minus any an editor hid. */
  @Get("startups")
  listStartups(@Query() query: Record<string, string>) {
    const { sector, stage, state, lookingFor, city } = query;
    return this.startups.listPublic(parseBody(startupDirectoryQuerySchema, { sector, stage, state, lookingFor, city }));
  }

  @Get("startups/:slug")
  getPublicStartup(@Param("slug") slug: string) {
    return this.startups.getPublic(slug);
  }
}
