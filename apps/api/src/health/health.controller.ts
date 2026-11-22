import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { sql } from "drizzle-orm";
import { todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";

/** For load balancers and container health checks: up only if the database answers. */
@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(@Inject(DB) private readonly db: Db) {}

  @Get()
  async health() {
    try {
      await this.db.execute(sql`select 1`);
    } catch {
      throw new ServiceUnavailableException({ ok: false, db: "down" });
    }
    return { ok: true, db: "up", date: todayInIndia() };
  }
}
