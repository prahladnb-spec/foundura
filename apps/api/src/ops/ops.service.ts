import { Inject, Injectable, Logger } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { CONFIG, type AppConfig } from "../config";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { jobRuns } from "../db/schema";
import { MailerService } from "../mail/mailer.service";

/** Same alert at most once in this window, so a failing page doesn't flood the inbox. */
const QUIET_MS = 30 * 60_000;

/** Scheduled jobs and the longest they may go without a successful run before someone is told. */
export const JOBS = {
  weekly_digest: { maxAgeHours: 8 * 24, needs: "SCHEDULED_EMAILS" },
  terms_reminder: { maxAgeHours: 2 * 24, needs: "SCHEDULED_EMAILS" },
  event_sync: { maxAgeHours: 2 * 24, needs: "EVENT_SYNC" },
} as const;
export type JobName = keyof typeof JOBS;

/**
 * Tells the operator when something goes wrong: server errors, failed scheduled jobs, and jobs that have
 * stopped running. Alerts go to OPS_ALERT_EMAIL and the server log. They never include request bodies,
 * so no visitor's personal data ends up in an inbox.
 */
@Injectable()
export class OpsService {
  private readonly log = new Logger("Ops");
  private readonly lastSent = new Map<string, number>();

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(MailerService) private readonly mailer: MailerService,
  ) {}

  /** Logs the problem and emails the operator, unless the same alert went out in the last 30 minutes. */
  async alert(subject: string, detail: string, key = subject, now = Date.now()): Promise<boolean> {
    this.log.error(`${subject}: ${detail.split("\n")[0]}`);
    const last = this.lastSent.get(key);
    if (last && now - last < QUIET_MS) return false;
    this.lastSent.set(key, now);
    if (this.lastSent.size > 500) this.lastSent.delete(this.lastSent.keys().next().value!);
    if (!this.config.OPS_ALERT_EMAIL) return false;
    try {
      await this.mailer.send({
        to: this.config.OPS_ALERT_EMAIL,
        subject: `[Foundura alert] ${subject}`.slice(0, 180),
        text: `${detail.slice(0, 4000)}\n\nSite: ${this.config.SITE_URL}\nTime (UTC): ${new Date(now).toISOString()}\nThe same alert is not repeated for 30 minutes.`,
      });
      return true;
    } catch (e) {
      this.log.error(`Could not send alert email: ${(e as Error).message}`);
      return false;
    }
  }

  /** Runs a scheduled job, recording start, success and failure. A thrown error or `failed(result)` counts as failure. */
  async track<T>(name: JobName, fn: () => Promise<T>, failed: (r: T) => string | null = () => null): Promise<T | undefined> {
    const started = new Date();
    await this.db
      .insert(jobRuns)
      .values({ name, lastStartedAt: started })
      .onConflictDoUpdate({ target: jobRuns.name, set: { lastStartedAt: started } });
    try {
      const r = await fn();
      const problem = failed(r);
      if (problem) await this.jobFailed(name, problem);
      else await this.db.update(jobRuns).set({ lastSuccessAt: new Date() }).where(sql`${jobRuns.name} = ${name}`);
      return r;
    } catch (e) {
      await this.jobFailed(name, (e as Error).stack ?? String(e));
      return undefined;
    }
  }

  private async jobFailed(name: JobName, error: string) {
    await this.db.update(jobRuns).set({ lastErrorAt: new Date(), lastError: error.slice(0, 2000) }).where(sql`${jobRuns.name} = ${name}`);
    await this.alert(`Scheduled job failed: ${name}`, error, `job-failed-${name}`);
  }

  /** Jobs that are switched on but haven't succeeded within their allowed time. */
  async staleJobs(now = new Date()): Promise<{ name: JobName; lastSuccessAt: Date | null }[]> {
    const rows = await this.db.select().from(jobRuns);
    const out: { name: JobName; lastSuccessAt: Date | null }[] = [];
    for (const [name, job] of Object.entries(JOBS) as [JobName, (typeof JOBS)[JobName]][]) {
      if (!this.config[job.needs]) continue;
      const row = rows.find((r) => r.name === name);
      // A job that has never run is only late once the server has been up longer than its allowed gap.
      const since = row?.lastSuccessAt ?? row?.lastStartedAt ?? null;
      const limit = job.maxAgeHours * 3_600_000;
      if (since ? now.getTime() - since.getTime() > limit : this.upFor(now) > limit) out.push({ name, lastSuccessAt: row?.lastSuccessAt ?? null });
    }
    return out;
  }

  async checkStale(now = new Date()) {
    for (const j of await this.staleJobs(now)) {
      await this.alert(
        `Scheduled job has stopped: ${j.name}`,
        `${j.name} has not finished successfully since ${j.lastSuccessAt?.toISOString() ?? "the server started"}. Check the API logs and the job's settings.`,
        `job-stale-${j.name}`,
        now.getTime(),
      );
    }
  }

  private readonly bootedAt = Date.now();
  private upFor(now: Date) {
    return now.getTime() - this.bootedAt;
  }
}
