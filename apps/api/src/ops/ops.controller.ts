import { timingSafeEqual } from "node:crypto";
import { Body, Controller, Headers, HttpCode, Inject, NotFoundException, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { z } from "zod";
import { parseBody } from "../common/zod";
import { CONFIG, type AppConfig } from "../config";
import { OpsService } from "./ops.service";

const reportSchema = z.object({
  source: z.literal("web"),
  message: z.string().max(500),
  path: z.string().max(300),
  digest: z.string().max(100).optional(),
  stack: z.string().max(4000).optional(),
});

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** The web server reports its own errors here, so all alerts come from one place. */
@Controller("ops")
export class OpsController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(OpsService) private readonly ops: OpsService,
  ) {}

  @Post("report")
  @HttpCode(202)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async report(@Headers("x-ops-token") token: string | undefined, @Body() body: unknown) {
    if (!this.config.OPS_REPORT_TOKEN) throw new NotFoundException();
    if (!token || !same(token, this.config.OPS_REPORT_TOKEN)) throw new UnauthorizedException();
    const r = parseBody(reportSchema, body);
    await this.ops.alert(`Web error: ${r.message.slice(0, 80)}`, `${r.path}${r.digest ? ` (digest ${r.digest})` : ""}\n\n${r.stack ?? r.message}`, `web-${r.message.slice(0, 120)}`);
    return { received: true };
  }
}
