import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";
import { OpsService } from "../ops/ops.service";
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
    @Inject(OpsService) private readonly ops: OpsService,
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
      // Individual sources failing (a site down for a day) is normal and shown in the editor console;
      // only alert when every source failed, which usually means the server can't reach the internet.
      const r = await this.ops.track("event_sync", () => this.sync.syncAll(today), (x) => (x.sources > 0 && x.failed === x.sources ? `All ${x.sources} event sources failed` : null));
      if (r) {
        this.doneDay = today;
        this.log.log(`Event sync: ${r.sources} sources, ${r.failed} failed.`);
      }
    } catch (e) {
      this.log.error(`Event sync failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
