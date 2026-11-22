import { describe, expect, it } from "vitest";
import { SendLimiter } from "./send-limiter";

describe("SendLimiter", () => {
  it("allows one code per 30 seconds and eight an hour per address", () => {
    const l = new SendLimiter();
    const t0 = 1_000_000_000;
    expect(l.take("a@x.in", t0)).toBe(0);
    expect(l.take("a@x.in", t0 + 10_000)).toBe(20);
    expect(l.take("b@x.in", t0 + 10_000)).toBe(0);
    for (let i = 1; i < 8; i++) expect(l.take("a@x.in", t0 + i * 60_000)).toBe(0);
    expect(l.take("a@x.in", t0 + 9 * 60_000)).toBeGreaterThan(0);
    expect(l.take("a@x.in", t0 + 61 * 60_000)).toBe(0);
  });
});
