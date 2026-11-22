import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type ConsentPurpose } from "@foundura/shared";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import { CONFIG, type AppConfig } from "../config";
import { ConsentService } from "../consent/consent.service";
import type { Db } from "../db/client";
import { MailerService } from "../mail/mailer.service";
import { tFor } from "../mail/templates";
import type { Locale } from "@foundura/shared";
import { DB } from "../db/db.module";
import { otpCodes, users } from "../db/schema";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export interface SessionUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(ConsentService) private readonly consents: ConsentService,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  private hash(email: string, code: string): string {
    return createHmac("sha256", this.config.JWT_SECRET).update(`${email}:${code}`).digest("hex");
  }

  /** Creates a 6-digit code. In dev mode it is returned so the web app can show it; otherwise it is emailed. */
  async requestOtp(rawEmail: string, locale?: Locale): Promise<{ sent: true; devCode?: string }> {
    const email = rawEmail.trim().toLowerCase();
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

    await this.db.delete(otpCodes).where(lt(otpCodes.expiresAt, new Date()));
    await this.db.delete(otpCodes).where(eq(otpCodes.email, email));
    await this.db.insert(otpCodes).values({
      email,
      codeHash: this.hash(email, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    // The code arrives in the language of the page they asked from, else their saved language.
    const lang = locale ?? (await this.db.select({ l: users.locale }).from(users).where(eq(users.email, email)).limit(1))[0]?.l;
    await this.sendEmail(email, code, lang); // dev mode: logged to the mailer outbox, not sent
    return this.config.OTP_DELIVERY === "dev" ? { sent: true, devCode: code } : { sent: true };
  }

  private async sendEmail(email: string, code: string, locale?: string) {
    try {
      await this.mailer.send({ to: email, ...tFor(locale).signIn(code) });
    } catch (e) {
      this.log.error((e as Error).message);
      throw new BadRequestException("Could not send the code. Try again in a minute.");
    }
  }

  async verifyOtp(
    rawEmail: string,
    code: string,
    consentsGiven: ConsentPurpose[] = [],
    locale?: Locale,
  ): Promise<{ token: string; user: SessionUser; isNew: boolean }> {
    const email = rawEmail.trim().toLowerCase();
    const [row] = await this.db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), gt(otpCodes.expiresAt, new Date())))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!row || row.attempts >= MAX_ATTEMPTS) throw new UnauthorizedException("Code expired. Ask for a new one.");

    const expected = Buffer.from(row.codeHash, "hex");
    const given = Buffer.from(this.hash(email, code), "hex");
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      await this.db.update(otpCodes).set({ attempts: row.attempts + 1 }).where(eq(otpCodes.id, row.id));
      throw new UnauthorizedException("That code is not right.");
    }
    await this.db.delete(otpCodes).where(eq(otpCodes.email, email));

    let [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    const isNew = !user;
    if (isNew) {
      if (!consentsGiven.includes("account")) {
        throw new BadRequestException("Please agree to the account terms to create your account.");
      }
      [user] = await this.db.insert(users).values({ email, locale: locale ?? "en" }).returning();
    }
    // Emails follow the language they last signed in with (and can be changed on the dashboard).
    await this.db
      .update(users)
      .set({ lastSeenAt: new Date(), ...(locale ? { locale } : {}) })
      .where(eq(users.id, user.id));
    for (const purpose of consentsGiven) {
      await this.consents.record(user.id, purpose, true, { onlyIfChanged: true });
    }

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email }, isNew };
  }

  async userFromToken(token: string): Promise<SessionUser> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token);
      const [user] = await this.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
      if (!user) throw new Error("gone");
      return { id: user.id, email: user.email };
    } catch {
      throw new UnauthorizedException("Please sign in again.");
    }
  }
}
