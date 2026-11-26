import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "../src/db/client";
import { dailyCounts } from "../src/db/schema";
import { DATABASE_URL, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const { db, pool } = createDb(DATABASE_URL);
const tag = Date.now().toString(36);

beforeAll(async () => {
  ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));
});
afterAll(async () => {
  await app?.close();
  await pool.end();
});

describe("startup city", () => {
  it("is saved, shown publicly, filterable, and can be cleared", async () => {
    const auth = await signIn(http, `city-${tag}@example.com`, ["account"], "192.0.2.10");
    const r = await http.post("/v1/me/startups").set(auth).send({ name: `Namma Labs ${tag}`, isPublic: true, state: "KA", city: "bengaluru" }).expect(201);
    await http.post("/v1/me/startups").set(auth).send({ name: "Bad City", city: "atlantis" }).expect(400);
    const list = (await http.get("/v1/startups?city=bengaluru").expect(200)).body as Array<{ name: string; city: string }>;
    expect(list.find((s) => s.name === `Namma Labs ${tag}`)?.city).toBe("bengaluru");
    expect(((await http.get("/v1/startups?city=pune").expect(200)).body as Array<{ name: string }>).some((s) => s.name === `Namma Labs ${tag}`)).toBe(false);
    await http.patch(`/v1/me/startups/${r.body.id}`).set(auth).send({ city: "" }).expect(200);
    expect((await http.get(`/v1/startups/${r.body.slug}`).expect(200)).body.city).toBeNull();
  });
});

describe("usage totals", () => {
  it("sums a few metrics over the last 30 days and nothing else", async () => {
    const day = (ago: number) => new Date(Date.now() - ago * 86_400_000).toISOString().slice(0, 10);
    await db.insert(dailyCounts).values([
      { day: day(1), metric: "scan_run", key: "", count: 4 },
      { day: day(3), metric: "scan_run", key: "", count: 2 },
      { day: day(40), metric: "scan_run", key: "", count: 100 },
      { day: day(2), metric: "template_download", key: "pitch-deck", count: 3 },
      { day: day(1), metric: "page_view", key: "/learn", count: 99 },
    ]);
    const res = (await http.get("/v1/stats/usage").expect(200)).body;
    expect(res.totals).toMatchObject({ scan_run: 6, template_download: 3, calendar_add: 0 });
    expect(res.totals).not.toHaveProperty("page_view");
  });
});
