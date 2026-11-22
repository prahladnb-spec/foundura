import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";
import { DigestService, weekOf } from "./digest.service";

/**
 * Sends the weekly digest on Mondays from 8:00 India time when DIGEST_AUTO_SEND=true.
 * Checks every 15 minutes; DigestService.run is idempotent per person per week, so restarts
 * and multiple API instances are safe.
 */
@Injectable()
export class DigestScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(DigestScheduler.name);
  private timer?: NodeJS.Timeout;
  private doneWeek: string | null = null;
  private running = false;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(DigestService) private readonly digest: DigestService,
  ) {}

  onModuleInit() {
    if (!this.config.DIGEST_AUTO_SEND) return;
    this.timer = setInterval(() => void this.tick(), 15 * 60_000);
    this.timer.unref();
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(now = new Date()) {
    const ist = new Date(now.getTime() + 5.5 * 3_600_000);
    const today = ist.toISOString().slice(0, 10);
    if (ist.getUTCDay() !== 1 || ist.getUTCHours() < 8) return;
    const week = weekOf(today);
    if (this.doneWeek === week || this.running) return;
    this.running = true;
    try {
      const r = await this.digest.run(today);
      if (r.failed === 0) this.doneWeek = week;
    } catch (e) {
      this.log.error(`Digest run failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
