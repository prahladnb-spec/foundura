import { describe, expect, it, vi } from "vitest";
import type { AppConfig } from "../src/config";
import { DigestScheduler } from "../src/digest/digest.scheduler";
import type { DigestService } from "../src/digest/digest.service";
import type { NewsletterService } from "../src/digest/newsletter.service";
import type { TermsReminderService } from "../src/legal/terms-reminder.service";
import type { OpsService } from "../src/ops/ops.service";

/** Runs jobs straight through, as OpsService does when nothing fails. */
const ops = { track: (_n: string, fn: () => Promise<unknown>) => fn() } as unknown as OpsService;

function make() {
  const run = vi.fn().mockResolvedValue({ failed: 0 });
  const remind = vi.fn().mockResolvedValue({ sent: 0, failed: 0 });
  const weekly = vi.fn().mockResolvedValue({ sent: 0, failed: 0 });
  const s = new DigestScheduler(
    { SCHEDULED_EMAILS: true } as AppConfig,
    { run } as unknown as DigestService,
    { run: remind } as unknown as TermsReminderService,
    ops,
    { run: weekly } as unknown as NewsletterService,
  );
  return { s, run, remind, weekly };
}

describe("email scheduler", () => {
  it("sends scheme alerts and the subscribers' email once on Monday from 8:00 India time", async () => {
    const { s, run, weekly } = make();
    await s.tick(new Date("2026-11-22T10:00:00Z")); // Sunday
    await s.tick(new Date("2026-11-23T02:00:00Z")); // Monday 07:30 IST
    expect(run).not.toHaveBeenCalled();
    await s.tick(new Date("2026-11-23T02:45:00Z")); // Monday 08:15 IST
    await s.tick(new Date("2026-11-23T03:00:00Z"));
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith("2026-11-23");
    expect(weekly).toHaveBeenCalledTimes(1);
    expect(weekly).toHaveBeenCalledWith("2026-11-23");
    await s.tick(new Date("2026-11-30T03:00:00Z")); // next Monday
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("retries alerts later if some emails failed", async () => {
    const { s, run } = make();
    run.mockResolvedValueOnce({ failed: 2 });
    await s.tick(new Date("2026-11-23T03:00:00Z"));
    await s.tick(new Date("2026-11-23T03:15:00Z"));
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("checks for yearly terms reminders once a day from 10:00 India time", async () => {
    const { s, remind } = make();
    await s.tick(new Date("2026-11-22T04:00:00Z")); // 09:30 IST
    expect(remind).not.toHaveBeenCalled();
    await s.tick(new Date("2026-11-22T05:00:00Z")); // 10:30 IST
    await s.tick(new Date("2026-11-22T09:00:00Z"));
    expect(remind).toHaveBeenCalledTimes(1);
    await s.tick(new Date("2026-11-23T05:00:00Z")); // next day
    expect(remind).toHaveBeenCalledTimes(2);
  });
});
