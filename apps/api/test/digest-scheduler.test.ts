import { describe, expect, it, vi } from "vitest";
import type { AppConfig } from "../src/config";
import { DigestScheduler } from "../src/digest/digest.scheduler";
import type { DigestService } from "../src/digest/digest.service";

function make() {
  const run = vi.fn().mockResolvedValue({ failed: 0 });
  const s = new DigestScheduler({ DIGEST_AUTO_SEND: true } as AppConfig, { run } as unknown as DigestService);
  return { s, run };
}

describe("digest scheduler", () => {
  it("runs once on Monday from 8:00 India time", async () => {
    const { s, run } = make();
    await s.tick(new Date("2026-11-22T10:00:00Z")); // Sunday
    await s.tick(new Date("2026-11-23T02:00:00Z")); // Monday 07:30 IST
    expect(run).not.toHaveBeenCalled();
    await s.tick(new Date("2026-11-23T02:45:00Z")); // Monday 08:15 IST
    await s.tick(new Date("2026-11-23T03:00:00Z"));
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith("2026-11-23");
    await s.tick(new Date("2026-11-30T03:00:00Z")); // next Monday
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("tries again later if some emails failed", async () => {
    const { s, run } = make();
    run.mockResolvedValueOnce({ failed: 2 });
    await s.tick(new Date("2026-11-23T03:00:00Z"));
    await s.tick(new Date("2026-11-23T03:15:00Z"));
    expect(run).toHaveBeenCalledTimes(2);
  });
});
