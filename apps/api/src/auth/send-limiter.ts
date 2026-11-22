/**
 * Limits how often a sign-in code can be emailed to one address, whatever IP the requests come
 * from, so nobody can flood someone's inbox. Kept in memory: Foundura runs one API process
 * (see DEPLOY.md); a restart only resets the counts.
 */
export class SendLimiter {
  private readonly sent = new Map<string, number[]>();

  constructor(
    private readonly gapMs = 30_000,
    private readonly perHour = 8,
  ) {}

  /** Seconds to wait before another code can go to this address, or 0 if one can go now (and records it). */
  take(key: string, now = Date.now()): number {
    const recent = (this.sent.get(key) ?? []).filter((t) => now - t < 3_600_000);
    const last = recent.at(-1);
    let wait = 0;
    if (last !== undefined && now - last < this.gapMs) wait = this.gapMs - (now - last);
    else if (recent.length >= this.perHour) wait = 3_600_000 - (now - recent[0]);
    if (wait > 0) {
      this.sent.set(key, recent);
      return Math.ceil(wait / 1000);
    }
    recent.push(now);
    this.sent.set(key, recent);
    if (this.sent.size > 50_000) this.prune(now);
    return 0;
  }

  private prune(now: number) {
    for (const [k, ts] of this.sent) if (!ts.some((t) => now - t < 3_600_000)) this.sent.delete(k);
  }
}
