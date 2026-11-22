import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";
import { OpsService } from "./ops.service";

/** Once an hour, checks that switched-on scheduled jobs are still succeeding. */
@Injectable()
export class OpsScheduler implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(OpsService) private readonly ops: OpsService,
  ) {}

  onModuleInit() {
    if (!this.config.SCHEDULED_EMAILS && !this.config.EVENT_SYNC) return;
    this.timer = setInterval(() => void this.ops.checkStale().catch(() => {}), 60 * 60_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
