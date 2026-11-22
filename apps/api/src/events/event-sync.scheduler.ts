import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";
import { EventSyncService } from "./event-sync.service";

/**
 * When EVENT_SYNC=true, reads every active event source once a day from 6:00 India time.
 * Checks every 30 minutes, so a restart or a failed run is picked up the same day.
 */
@Injectable()
export class EventSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(EventSyncScheduler.name);
  private timer?: NodeJS.Timeout;
  private doneDay: string | null = null;
  private running = false;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(EventSyncService) private readonly sync: EventSyncService,
  ) {}

  onModuleInit() {
    if (!this.config.EVENT_SYNC) return;
    this.timer = setInterval(() => void this.tick(), 30 * 60_000);
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
    if (ist.getUTCHours() < 6 || this.doneDay === today) return;
    this.running = true;
    try {
      const r = await this.sync.syncAll(today);
      this.doneDay = today;
      this.log.log(`Event sync: ${r.sources} sources, ${r.failed} failed.`);
    } catch (e) {
      this.log.error(`Event sync failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
