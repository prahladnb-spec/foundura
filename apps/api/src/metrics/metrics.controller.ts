import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { metricBeaconSchema } from "@foundura/shared";
import { AdminGuard } from "../admin/admin.guard";
import { parseBody } from "../common/zod";
import { MetricsService } from "./metrics.service";

@Controller()
export class MetricsController {
  constructor(@Inject(MetricsService) private readonly metrics: MetricsService) {}

  /** Counts from the browser (through the web server's /api/m). Nothing about the visitor is stored. */
  @Post("metrics")
  @HttpCode(204)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async count(@Body() body: unknown) {
    const { metric, key } = parseBody(metricBeaconSchema, body);
    await this.metrics.bump(metric, key);
  }

  @Get("admin/metrics")
  @UseGuards(AdminGuard)
  summary(@Query("days") days?: string) {
    const n = Math.min(Math.max(Number(days) || 30, 7), 365);
    return this.metrics.summary(n);
  }
}
