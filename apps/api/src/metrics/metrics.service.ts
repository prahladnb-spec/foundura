import { Inject, Injectable, Logger } from "@nestjs/common";
import { METRICS, type Metric } from "@foundura/shared";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { dailyCounts } from "../db/schema";

const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Daily totals of anonymous usage. Counting never fails the request it belongs to. */
@Injectable()
export class MetricsService {
  private readonly log = new Logger(MetricsService.name);

  constructor(@Inject(DB) private readonly db: Db) {}

  async bump(metric: Metric, key = "", day = todayInIndia()): Promise<void> {
    try {
      await this.db
        .insert(dailyCounts)
        .values({ day, metric, key: key.slice(0, 120), count: 1 })
        .onConflictDoUpdate({ target: [dailyCounts.day, dailyCounts.metric, dailyCounts.key], set: { count: sql`${dailyCounts.count} + 1` } });
    } catch (e) {
      this.log.warn(`Could not count ${metric}: ${(e as Error).message}`);
    }
  }

  /** Totals and a daily series for each metric over the last `days` days, plus the top pages and templates. */
  async summary(days = 30, today = todayInIndia()) {
    const from = addDays(today, -(days - 1));
    const rows = await this.db
      .select({ day: dailyCounts.day, metric: dailyCounts.metric, total: sql<number>`sum(${dailyCounts.count})::int` })
      .from(dailyCounts)
      .where(gte(dailyCounts.day, from))
      .groupBy(dailyCounts.day, dailyCounts.metric);
    const dates = Array.from({ length: days }, (_, i) => addDays(from, i));
    const metrics = (Object.keys(METRICS) as Metric[]).map((m) => {
      const series = dates.map((d) => rows.find((r) => r.metric === m && r.day === d)?.total ?? 0);
      return { metric: m, label: METRICS[m].label, total: series.reduce((a, b) => a + b, 0), series };
    });
    const top = (metric: Metric) =>
      this.db
        .select({ key: dailyCounts.key, total: sql<number>`sum(${dailyCounts.count})::int` })
        .from(dailyCounts)
        .where(and(eq(dailyCounts.metric, metric), gte(dailyCounts.day, from)))
        .groupBy(dailyCounts.key)
        .orderBy(desc(sql`sum(${dailyCounts.count})`))
        .limit(15);
    return { from, to: today, dates, metrics, topPages: await top("page_view"), topTemplates: await top("template_download") };
  }
}
