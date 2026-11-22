import { Inject, Injectable, Logger } from "@nestjs/common";
import { PRIVACY_NOTICE_VERSION } from "@foundura/shared";
import { eq, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { users } from "../db/schema";
import { MailerService } from "../mail/mailer.service";
import { siteLink, tFor } from "../mail/templates";

const BATCH = 300;

/**
 * Once a year, remind each account holder of the terms of use and privacy notice, as the IT
 * (Intermediary Guidelines) Rules 2021 require. A service notice, so it goes to everyone with an account.
 */
@Injectable()
export class TermsReminderService {
  private readonly log = new Logger(TermsReminderService.name);

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  /** Accounts whose last reminder (or sign-up, if none yet) was over a year ago. */
  private due(now: Date) {
    return this.db
      .select({ id: users.id, email: users.email, locale: users.locale })
      .from(users)
      .where(sql`coalesce(${users.termsRemindedAt}, ${users.createdAt}) < ${now.toISOString()}::timestamptz - interval '365 days'`)
      .orderBy(users.createdAt)
      .limit(BATCH);
  }

  render(locale: "en" | "hi" = "en") {
    return tFor(locale).reminder((path) => siteLink(this.mailer.siteUrl, locale, path), PRIVACY_NOTICE_VERSION);
  }

  async run(now = new Date()): Promise<{ sent: number; failed: number }> {
    const list = await this.due(now);
    let sent = 0;
    let failed = 0;
    for (const u of list) {
      try {
        await this.mailer.send({ to: u.email, ...this.render(u.locale) });
        await this.db.update(users).set({ termsRemindedAt: now }).where(eq(users.id, u.id));
        sent++;
        if (!this.mailer.isDev) await new Promise((r) => setTimeout(r, 600));
      } catch (e) {
        failed++;
        this.log.error(`Terms reminder to user ${u.id} failed: ${(e as Error).message}`);
      }
    }
    if (list.length) this.log.log(`Terms reminders: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }
}
