import { AdminGuard } from "../admin/admin.guard";
import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  introRequestSchema,
  introResponseSchema,
  investorProfileSchema,
  setConsentSchema,
  startupProfileSchema,
} from "@foundura/shared";
import { IntrosService } from "../investors/intros.service";
import { InvestorsService } from "../investors/investors.service";
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
    @Inject(InvestorsService) private readonly investors: InvestorsService,
    @Inject(IntrosService) private readonly intros: IntrosService,
    @Inject(AdminGuard) private readonly adminGuard: AdminGuard,
  ) {}

  @Get()
  async me(@CurrentUser() user: SessionUser) {
    return {
      user,
      isAdmin: this.adminGuard.isAdminEmail(user.email),
      startups: await this.startups.listMine(user.id),
      investor: await this.investors.getMine(user.id),
      consents: await this.consents.current(user.id),
    };
  }

  // ----- readiness, matches and intros (founder side) -----

  @Get("startups/:id/readiness")
  readiness(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.intros.readinessFor(user.id, id);
  }

  @Get("startups/:id/investor-matches")
  investorMatches(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.intros.investorMatches(user.id, id);
  }

  @Post("startups/:id/intros")
  requestIntro(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() body: unknown) {
    const { investorId, message } = parseBody(introRequestSchema, body);
    return this.intros.request(user.id, id, investorId, message);
  }

  @Get("intros")
  listIntros(@CurrentUser() user: SessionUser) {
    return this.intros.listForUser(user.id);
  }

  @Post("intros/:id/respond")
  @HttpCode(200)
  respondIntro(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() body: unknown) {
    return this.intros.respond(user.id, id, parseBody(introResponseSchema, body).accept);
  }

  @Post("intros/:id/withdraw")
  @HttpCode(200)
  withdrawIntro(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.intros.withdraw(user.id, id);
  }

  // ----- investor profile -----

  @Get("investor")
  getInvestor(@CurrentUser() user: SessionUser) {
    return this.investors.getMine(user.id);
  }

  @Post("investor")
  createInvestor(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    return this.investors.create(user.id, parseBody(investorProfileSchema, body));
  }

  @Patch("investor")
  updateInvestor(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    return this.investors.update(user.id, parseBody(investorProfileSchema, body));
  }

  @Get("investor/matches")
  startupMatches(@CurrentUser() user: SessionUser) {
    return this.intros.startupMatches(user.id);
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
    const investor = await this.investors.getMine(user.id);
    return {
      exportedAt: new Date().toISOString(),
      account: row,
      startups: await this.startups.listMine(user.id),
      investorProfile: investor,
      introRequests: await this.intros.exportFor(user.id, investor),
      consentHistory: await this.consents.history(user.id),
    };
  }

  /** Right to erasure: deletes the account; startups, investor profile, intros and consent rows cascade. */
  @Delete()
  @HttpCode(204)
  async deleteAccount(@CurrentUser() user: SessionUser) {
    await this.db.delete(users).where(eq(users.id, user.id));
  }
}
