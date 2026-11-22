import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ADMIN_KEY, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const admin = { "x-admin-key": ADMIN_KEY };

beforeAll(async () => {
  ({ app, http } = await startTestApp());
});
afterAll(async () => {
  await app?.close();
});

const summary = async () => (await http.get("/v1/admin/metrics?days=7").set(admin).expect(200)).body as {
  dates: string[];
  metrics: { metric: string; total: number; series: number[] }[];
  topPages: { key: string; total: number }[];
  topTemplates: { key: string; total: number }[];
};
const total = (s: Awaited<ReturnType<typeof summary>>, m: string) => s.metrics.find((x) => x.metric === m)!.total;

describe("anonymous usage counts", () => {
  it("counts browser beacons as daily totals per page or template", async () => {
    await http.post("/v1/metrics").send({ metric: "page_view", key: "/schemes" }).expect(204);
    await http.post("/v1/metrics").send({ metric: "page_view", key: "/schemes" }).expect(204);
    await http.post("/v1/metrics").send({ metric: "page_view", key: "/hi/events" }).expect(204);
    await http.post("/v1/metrics").send({ metric: "template_download", key: "pitch-deck" }).expect(204);
    const s = await summary();
    expect(s.dates).toHaveLength(7);
    expect(total(s, "page_view")).toBe(3);
    expect(s.metrics.find((x) => x.metric === "page_view")!.series.at(-1)).toBe(3);
    expect(s.topPages[0]).toEqual({ key: "/schemes", total: 2 });
    expect(s.topTemplates).toEqual([{ key: "pitch-deck", total: 1 }]);
  });

  it("the browser can't send server-side metrics, odd keys or extra data", async () => {
    await http.post("/v1/metrics").send({ metric: "signup" }).expect(400);
    await http.post("/v1/metrics").send({ metric: "page_view", key: "/dashboard?u=someone@example.com" }).expect(400);
    await http.post("/v1/metrics").send({ metric: "page_view", key: "x".repeat(200) }).expect(400);
  });

  it("counts scans, sign-ups and calendar feed reads on the server", async () => {
    const before = await summary();
    await http.post("/v1/scan").send({ state: "KA", entityType: "private_limited", stage: "prototype" }).expect(200);
    await signIn(http, `counted-${Date.now()}@example.com`);
    await http.get("/v1/events/calendar.ics").expect(200);
    // Counting doesn't hold up the request it belongs to, so the totals can land a moment later.
    await vi.waitFor(async () => {
      const after = await summary();
      expect(total(after, "scan_run")).toBe(total(before, "scan_run") + 1);
      expect(total(after, "signup")).toBe(total(before, "signup") + 1);
      expect(total(after, "calendar_feed_read")).toBe(total(before, "calendar_feed_read") + 1);
    }, { timeout: 5000, interval: 100 });
  });

  it("only editors see the summary", async () => {
    await http.get("/v1/admin/metrics").expect(401);
  });
});
