import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";
import { TermsReminderService } from "../legal/terms-reminder.service";
import { DigestService, weekOf } from "./digest.service";

/**
 * Scheduled emails, when SCHEDULED_EMAILS=true. Checks every 15 minutes:
 * - weekly scheme alerts on Mondays from 8:00 India time;
 * - yearly terms reminders, checked daily from 10:00 India time.
 * Both jobs are safe to run again, so restarts and multiple API instances are fine.
 */
@Injectable()
export class DigestScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(DigestScheduler.name);
  private timer?: NodeJS.Timeout;
  private doneWeek: string | null = null;
  private doneReminderDay: string | null = null;
  private running = false;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(DigestService) private readonly digest: DigestService,
    @Inject(TermsReminderService) private readonly reminders: TermsReminderService,
  ) {}

  onModuleInit() {
    if (!this.config.SCHEDULED_EMAILS) return;
    this.timer = setInterval(() => void this.tick(), 15 * 60_000);
    this.timer.unref();
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(now = new Date()) {
    if (this.running) return;
    const ist = new Date(now.getTime() + 5.5 * 3_600_000);
    const today = ist.toISOString().slice(0, 10);
    const hour = ist.getUTCHours();
    this.running = true;
    try {
      if (ist.getUTCDay() === 1 && hour >= 8 && this.doneWeek !== weekOf(today)) {
        const r = await this.digest.run(today);
        if (r.failed === 0) this.doneWeek = weekOf(today);
      }
      if (hour >= 10 && this.doneReminderDay !== today) {
        const r = await this.reminders.run(now);
        if (r.failed === 0) this.doneReminderDay = today;
      }
    } catch (e) {
      this.log.error(`Scheduled emails failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
