import path from "node:path";
import type { INestApplication } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SCHEMES } from "../db/seed-data/schemes";
import { loadConfig } from "../src/config";
import { createDb } from "../src/db/client";
import { schemes } from "../src/db/schema";
import { createApp } from "../src/main";

const DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://foundura:foundura@localhost:5432/foundura_test";

let app: INestApplication;
let http: ReturnType<typeof request>;

beforeAll(async () => {
  const { db, pool } = createDb(DATABASE_URL);
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
  await migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });
  for (const s of SCHEMES) {
    await db.insert(schemes).values({ ...s, state: s.state ?? null, statusNote: s.statusNote ?? null });
  }
  await pool.end();

  const config = loadConfig({
    DATABASE_URL,
    JWT_SECRET: "test-secret-test-secret-123",
    ADMIN_API_KEY: "test-admin-key-123",
    OTP_DELIVERY: "dev",
    NODE_ENV: "test",
  });
  app = await createApp(config);
  await app.init();
  http = request(app.getHttpServer());
});

afterAll(async () => {
  await app?.close();
});

async function signIn(email: string, consents = ["account"]) {
  const r1 = await http.post("/v1/auth/request-otp").send({ email }).expect(200);
  const r2 = await http.post("/v1/auth/verify-otp").send({ email, code: r1.body.devCode, consents }).expect(200);
  return r2.body.token as string;
}

describe("Foundura API", () => {
  it("reports health", async () => {
    const r = await http.get("/v1/health").expect(200);
    expect(r.body.ok).toBe(true);
  });

  it("runs an anonymous Scheme Scan and ranks eligible schemes first", async () => {
    const r = await http
      .post("/v1/scan")
      .send({
        entityType: "private_limited",
        incorporationDate: "2025-06-01",
        turnoverInrCr: 0.4,
        dpiitRecognised: true,
        state: "KA",
        sectors: ["medtech"],
        stage: "prototype",
        isDeepTech: true,
      })
      .expect(200);
    expect(r.body.counts.eligible).toBeGreaterThan(0);
    expect(r.body.matches[0].status).toBe("eligible");
    const slugs = r.body.matches.map((m: { scheme: { slug: string } }) => m.scheme.slug);
    expect(slugs).toContain("karnataka-startup-policy-2025-30");
    expect(slugs).not.toContain("uttar-pradesh-startup-policy-2026"); // other states filtered out
  });

  it("rejects invalid scan answers with a readable error", async () => {
    const r = await http.post("/v1/scan").send({ turnoverInrCr: -5 }).expect(400);
    expect(r.body.issues[0].path).toBe("turnoverInrCr");
  });

  it("refuses to create an account without the required consent", async () => {
    const email = "noconsent@example.com";
    const r1 = await http.post("/v1/auth/request-otp").send({ email }).expect(200);
    await http.post("/v1/auth/verify-otp").send({ email, code: r1.body.devCode, consents: [] }).expect(400);
  });

  it("rejects a wrong code", async () => {
    const email = "wrong@example.com";
    await http.post("/v1/auth/request-otp").send({ email }).expect(200);
    await http.post("/v1/auth/verify-otp").send({ email, code: "000000", consents: ["account"] }).expect(401);
  });

  it("supports the full founder journey: profile, scan, consent, export, erasure", async () => {
    const token = await signIn("founder@example.com", ["account", "scheme_alerts"]);
    const auth = { Authorization: `Bearer ${token}` };

    const me = await http.get("/v1/me").set(auth).expect(200);
    expect(me.body.user.email).toBe("founder@example.com");
    expect(me.body.consents.find((c: { purpose: string }) => c.purpose === "scheme_alerts").granted).toBe(true);

    const created = await http
      .post("/v1/me/startups")
      .set(auth)
      .send({
        name: "Shravya Devices",
        entityType: "private_limited",
        incorporationDate: "2024-02-10",
        state: "UP",
        sectors: ["medtech"],
        stage: "prototype",
        dpiitRecognised: true,
        isPublic: true,
      })
      .expect(201);
    const id = created.body.id;
    expect(created.body.slug).toMatch(/^shravya-devices-/);

    const scan = await http.get(`/v1/me/startups/${id}/scan`).set(auth).expect(200);
    const up = scan.body.matches.find((m: { scheme: { slug: string } }) => m.scheme.slug === "uttar-pradesh-startup-policy-2026");
    expect(up.status).toBe("eligible");

    // Public profile hides sensitive figures
    await http.patch(`/v1/me/startups/${id}`).set(auth).send({ turnoverInrCr: 1.2 }).expect(200);
    const pub = await http.get(`/v1/startups/${created.body.slug}`).expect(200);
    expect(pub.body.name).toBe("Shravya Devices");
    expect(pub.body.turnoverInrCr).toBeUndefined();

    // Withdraw a consent; the ledger keeps both decisions
    await http.post("/v1/me/consents").set(auth).send({ purpose: "scheme_alerts", granted: false }).expect(200);
    const exp = await http.get("/v1/me/export").set(auth).expect(200);
    expect(exp.body.startups).toHaveLength(1);
    const alerts = exp.body.consentHistory.filter((c: { purpose: string }) => c.purpose === "scheme_alerts");
    expect(alerts.map((c: { granted: boolean }) => c.granted)).toEqual([true, false]);

    // Another user cannot touch this startup
    const other = await signIn("other@example.com");
    await http.get(`/v1/me/startups/${id}`).set({ Authorization: `Bearer ${other}` }).expect(403);

    // Erasure removes the account, startup and token validity
    await http.delete("/v1/me").set(auth).expect(204);
    await http.get("/v1/me").set(auth).expect(401);
    await http.get(`/v1/startups/${created.body.slug}`).expect(404);
  });

  it("imports events from a tracker-sheet CSV with the admin key only", async () => {
    const csv = [
      "Event,Start,End,City / venue,Country,Scope,Type,Status,Key deadline,Best for,Cost & notes,Source,Last checked",
      'Test Expo 2030,05/01/2030,06/01/2030,Pune,India,India,Expo,Confirmed,,Founders,Free,[Organiser](https://example.com/expo),22/11/2026',
    ].join("\n");
    await http.post("/v1/admin/import/events").set("Content-Type", "text/csv").send(csv).expect(401);
    const r = await http
      .post("/v1/admin/import/events")
      .set({ "Content-Type": "text/csv", "x-admin-key": "test-admin-key-123" })
      .send(csv)
      .expect(200);
    expect(r.body.imported).toBe(1);
    const list = await http.get("/v1/events").expect(200);
    const ev = list.body.find((e: { name: string }) => e.name === "Test Expo 2030");
    expect(ev.startDate).toBe("2030-01-05");
    expect(ev.sourceUrl).toBe("https://example.com/expo");
  });
});
