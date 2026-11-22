import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { unsubscribeSchema } from "@foundura/shared";
import { eq } from "drizzle-orm";
import { Admin, type AdminActor, AdminGuard } from "../admin/admin.guard";
import { AuditService } from "../admin/audit.service";
import { parseBody, todayInIndia } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { type Startup, startups } from "../db/schema";
import { DigestService } from "./digest.service";

@Controller("digest")
export class DigestController {
  constructor(@Inject(DigestService) private readonly digest: DigestService) {}

  /**
   * One-click unsubscribe. Accepts the link parameters in the body (from the confirmation page)
   * or the query string (RFC 8058 List-Unsubscribe-Post from mail apps).
   */
  @Post("unsubscribe")
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async unsubscribe(@Body() body: unknown, @Query() query: Record<string, string>) {
    const src = body && typeof body === "object" && "u" in body ? body : query;
    const { u, t } = parseBody(unsubscribeSchema, src);
    if (!(await this.digest.unsubscribe(u, t))) throw new BadRequestException("This unsubscribe link isn't valid.");
    return { unsubscribed: true };
  }
}

@Controller("admin/digest")
@UseGuards(AdminGuard)
export class AdminDigestController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(DigestService) private readonly digest: DigestService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  /**
   * Preview this week's email as a first-time recipient would see it. Uses the editor's own
   * startup profile if they have one, otherwise a made-up sample, never another founder's data.
   */
  @Get("preview")
  async preview(@Admin() actor: AdminActor, @Query("locale") locale?: string) {
    const lang = locale === "hi" ? "hi" : "en";
    const today = todayInIndia();
    const [own] = actor.actorId
      ? await this.db.select().from(startups).where(eq(startups.ownerId, actor.actorId)).limit(1)
      : [];
    const startup = own ?? sampleStartup(today);
    const content = await this.digest.compose(startup, null, await this.digest.sharedContent(today), today);
    return {
      basedOn: own ? "your startup profile" : "a sample Karnataka medtech startup",
      hasNews: this.digest.hasNews(content),
      ...this.digest.render(content, this.digest.unsubscribeUrl("preview", lang), lang),
    };
  }

  @Post("send")
  @HttpCode(200)
  async send(@Admin() actor: AdminActor) {
    const r = await this.digest.run();
    await this.audit.record(actor, "digest.send", "digest", r.weekOf, { sent: r.sent, failed: r.failed });
    return r;
  }
}

function sampleStartup(today: string): Startup {
  const twoYearsAgo = `${Number(today.slice(0, 4)) - 2}${today.slice(4)}`;
  return {
    name: "Sample startup",
    entityType: "private_limited",
    incorporationDate: twoYearsAgo,
    turnoverInrCr: 0.5,
    dpiitRecognised: true,
    state: "KA",
    sectors: ["medtech"],
    stage: "prototype",
    isDeepTech: null,
    womenLed: null,
    govtSupportReceivedInrLakh: null,
    indianPromoterSharePct: null,
  } as unknown as Startup;
}
