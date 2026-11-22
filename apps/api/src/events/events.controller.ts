import { Controller, Get, Header, Inject, NotFoundException, Param, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { eventQuerySchema, regionOf } from "@foundura/shared";
import { and, asc, eq, gte, isNotNull, isNull, lte, or, type SQL, sql } from "drizzle-orm";
import { parseBody, todayInIndia } from "../common/zod";
import { CONFIG, type AppConfig } from "../config";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { events } from "../db/schema";
import { toIcs } from "./ics";

type Q = Record<string, string | undefined>;

/** Public events: the list, the calendar's month ranges, and iCalendar feeds people can subscribe to. */
@SkipThrottle()
@Controller()
export class EventsController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  /**
   * Published events. With `from` and `to`, every event that overlaps that range (for a calendar month);
   * otherwise upcoming ones, or all of them with `?all=1`. Filters: scope, region, format, type.
   * Each event carries its region, worked out from its country.
   */
  @Get("events")
  async list(@Query() q: Q) {
    const rows = await this.query(q);
    return rows.map(({ sourceId: _s, externalId: _x, published: _p, ...e }) => ({ ...e, region: e.format === "Online" ? null : regionOf(e.country) }));
  }

  /** A calendar feed of upcoming events with the same filters. Subscribe once; calendar apps refresh it. */
  @Get("events/calendar.ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Cache-Control", "public, max-age=1800")
  async feed(@Query() q: Q) {
    const rows = await this.query({ ...q, from: undefined, to: undefined, all: undefined });
    const label = [q.region, q.scope === "India" ? "India" : null, q.format].filter(Boolean).join(", ");
    return toIcs(rows, this.config.SITE_URL, label ? `Foundura: startup events (${label})` : undefined);
  }

  /** One event, to add to a calendar. */
  @Get("events/:slug/ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  async one(@Param("slug") slug: string) {
    const [e] = await this.db.select().from(events).where(and(eq(events.slug, slug), eq(events.published, true))).limit(1);
    if (!e) throw new NotFoundException("Event not found.");
    return toIcs([e], this.config.SITE_URL, e.name);
  }

  private async query(q: Q) {
    const { from, to, scope, region, format, type } = parseBody(eventQuerySchema, {
      from: q.from || undefined,
      to: q.to || undefined,
      scope: q.scope || undefined,
      region: q.region || undefined,
      format: q.format || undefined,
      type: q.type || undefined,
    });
    const where: SQL[] = [eq(events.published, true)];
    if (scope) where.push(eq(events.scope, scope));
    if (type) where.push(eq(events.type, type));
    if (format) where.push(eq(events.format, format));
    if (from && to) {
      // Anything that overlaps the range, including deadline-only items whose deadline falls in it.
      where.push(
        or(
          and(isNotNull(events.startDate), lte(events.startDate, to), gte(sql`coalesce(${events.endDate}, ${events.startDate})`, from)),
          and(isNull(events.startDate), isNotNull(events.deadline), gte(events.deadline, from), lte(events.deadline, to)),
        )!,
      );
    } else if (!q.all) {
      const today = todayInIndia();
      where.push(
        or(
          gte(events.endDate, today),
          and(isNull(events.endDate), gte(events.startDate, today)),
          and(isNull(events.startDate), isNotNull(events.deadline), gte(events.deadline, today)),
        )!,
      );
    }
    const rows = await this.db
      .select()
      .from(events)
      .where(and(...where))
      .orderBy(asc(events.startDate), asc(events.deadline))
      .limit(1000);
    return region ? rows.filter((e) => e.format !== "Online" && regionOf(e.country) === region) : rows;
  }
}
