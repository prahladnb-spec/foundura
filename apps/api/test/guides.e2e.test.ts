import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "../src/db/client";
import { articles, dailyCounts } from "../src/db/schema";
import { DATABASE_URL, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const { db, pool } = createDb(DATABASE_URL);
const day = (ago: number) => new Date(Date.now() - ago * 86_400_000).toISOString().slice(0, 10);
const guide = (slug: string, publishedAt: string | null, extra: Partial<typeof articles.$inferInsert> = {}) => ({
  slug,
  title: `Guide ${slug}`,
  theme: "Growth Friday",
  excerpt: "A short summary of the guide for the list.",
  body: "Body text. ".repeat(40),
  readMinutes: 2,
  publishedAt,
  ...extra,
});

beforeAll(async () => {
  ({ app, http } = await startTestApp());
  await db.insert(articles).values([
    guide("alpha", "2026-11-20", { topic: "selling", authorName: "Asha Rao", authorRole: "Founder", authorConsentAt: new Date() }),
    guide("beta", "2026-11-21"),
    guide("draft", null),
  ]);
  await db.insert(dailyCounts).values([
    { day: day(1), metric: "page_view", key: "/learn/beta", count: 5 },
    { day: day(2), metric: "page_view", key: "/hi/learn/beta", count: 3 },
    { day: day(1), metric: "page_view", key: "/learn/alpha", count: 6 },
    { day: day(45), metric: "page_view", key: "/learn/alpha", count: 100 },
    { day: day(1), metric: "page_view", key: "/learn/draft", count: 50 },
    { day: day(1), metric: "page_view", key: "/learn/missing", count: 50 },
    { day: day(1), metric: "template_download", key: "/learn/alpha", count: 50 },
  ]);
});
afterAll(async () => {
  await app?.close();
  await pool.end();
});

describe("guides", () => {
  it("lists topic and author, and never the consent date", async () => {
    const list = (await http.get("/v1/articles").expect(200)).body as Array<Record<string, unknown>>;
    expect(list.find((a) => a.slug === "alpha")).toMatchObject({ topic: "selling", authorName: "Asha Rao" });
    expect(list.find((a) => a.slug === "beta")).toMatchObject({ topic: "start", authorName: null });
    const one = (await http.get("/v1/articles/alpha").expect(200)).body;
    expect(one.authorRole).toBe("Founder");
    expect(one).not.toHaveProperty("authorConsentAt");
  });

  it("ranks the most-read published guides over the last 30 days, all languages together", async () => {
    const top = (await http.get("/v1/articles/popular").expect(200)).body as Array<{ slug: string; views: number }>;
    expect(top.map((t) => [t.slug, t.views])).toEqual([
      ["beta", 8],
      ["alpha", 6],
    ]);
  });
});
