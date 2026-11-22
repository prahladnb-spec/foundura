import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { setConsentSchema, startupProfileSchema } from "@foundura/shared";
import { eq } from "drizzle-orm";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { SessionUser } from "../auth/auth.service";
import { parseBody } from "../common/zod";
import { ConsentService } from "../consent/consent.service";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { users } from "../db/schema";
import { ScanService } from "../scan/scan.service";
import { StartupsService, toScanInput } from "../startups/startups.service";

/** Everything about the signed-in person: profile, startups, consents and DPDP/GDPR rights. */
@Controller("me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
    @Inject(ConsentService) private readonly consents: ConsentService,
    @Inject(ScanService) private readonly scans: ScanService,
  ) {}

  @Get()
  async me(@CurrentUser() user: SessionUser) {
    return { user, startups: await this.startups.listMine(user.id), consents: await this.consents.current(user.id) };
  }

  // ----- startups -----

  @Post("startups")
  createStartup(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    return this.startups.create(user.id, parseBody(startupProfileSchema, body));
  }

  @Get("startups/:id")
  getStartup(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.startups.getMine(user.id, id);
  }

  @Patch("startups/:id")
  updateStartup(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() body: unknown) {
    return this.startups.update(user.id, id, parseBody(startupProfileSchema.partial(), body));
  }

  @Delete("startups/:id")
  @HttpCode(204)
  async deleteStartup(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    await this.startups.remove(user.id, id);
  }

  /** Scheme Scan run from the saved profile. */
  @Get("startups/:id/scan")
  async scanStartup(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    const s = await this.startups.getMine(user.id, id);
    return this.scans.scan(toScanInput(s));
  }

  // ----- consent and data rights -----

  @Get("consents")
  getConsents(@CurrentUser() user: SessionUser) {
    return this.consents.current(user.id);
  }

  @Post("consents")
  @HttpCode(200)
  async setConsent(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    const { purpose, granted } = parseBody(setConsentSchema, body);
    await this.consents.record(user.id, purpose, granted, { onlyIfChanged: true });
    return this.consents.current(user.id);
  }

  /** Right of access / portability: everything we hold about this person, as JSON. */
  @Get("export")
  async export(@CurrentUser() user: SessionUser) {
    const [row] = await this.db.select().from(users).where(eq(users.id, user.id));
    return {
      exportedAt: new Date().toISOString(),
      account: row,
      startups: await this.startups.listMine(user.id),
      consentHistory: await this.consents.history(user.id),
    };
  }

  /** Right to erasure: deletes the account; startups and consent rows cascade. */
  @Delete()
  @HttpCode(204)
  async deleteAccount(@CurrentUser() user: SessionUser) {
    await this.db.delete(users).where(eq(users.id, user.id));
  }
}
