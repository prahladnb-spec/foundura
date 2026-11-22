import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { loadConfig, productionProblems } from "../src/config";
import { startTestApp } from "./helpers";

const SAFE = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://u:p@db:5432/foundura",
  JWT_SECRET: "q8Zr2mV0xKpL4nT7wYb1cD5fGh9jS3uA",
  ADMIN_API_KEY: "Hk3Pq9Lm2Zx7Vb4Nc8Rt1Yw6",
  SITE_URL: "https://foundura.org",
  CORS_ORIGINS: "https://foundura.org",
  OTP_DELIVERY: "email",
  RESEND_API_KEY: "re_live_key",
  OTP_FROM_EMAIL: "Foundura <login@foundura.org>",
  TRUST_PROXY: "1",
};

describe("production settings", () => {
  it("accepts a safe production configuration", () => {
    expect(() => loadConfig(SAFE)).not.toThrow();
  });

  it("refuses unsafe settings and lists every problem", () => {
    const bad = { ...SAFE, OTP_DELIVERY: "dev", JWT_SECRET: "change-me-change-me", SITE_URL: "http://foundura.org", TRUST_PROXY: "0" };
    expect(() => loadConfig(bad)).toThrow(/Unsafe production settings/);
    const problems = productionProblems({ ...loadConfig({ ...bad, NODE_ENV: "development" }), NODE_ENV: "production" });
    expect(problems.join("\n")).toMatch(/OTP_DELIVERY/);
    expect(problems.join("\n")).toMatch(/JWT_SECRET/);
    expect(problems.join("\n")).toMatch(/SITE_URL/);
    expect(problems.join("\n")).toMatch(/TRUST_PROXY/);
    expect(() => loadConfig({ ...SAFE, OTP_FROM_EMAIL: "Foundura <login@example.com>" })).toThrow(/OTP_FROM_EMAIL/);
    expect(() => loadConfig({ ...SAFE, CORS_ORIGINS: "https://foundura.org,http://localhost:3000" })).toThrow(/CORS_ORIGINS/);
  });
});

describe("behind the web server", () => {
  let app: INestApplication;
  afterAll(() => app?.close());

  it("rate-limits per visitor IP, skips public reads, and reports database health", async () => {
    let http: ReturnType<typeof request>;
    ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));

    const ask = (ip: string) =>
      http.post("/v1/auth/request-otp").set("X-Forwarded-For", ip).send({ email: `rate-${ip}@example.com` });
    for (let i = 0; i < 5; i++) expect((await ask("203.0.113.7")).status).toBe(200);
    expect((await ask("203.0.113.7")).status).toBe(429);
    expect((await ask("198.51.100.9")).status).toBe(200); // a different visitor is unaffected

    for (let i = 0; i < 130; i++) await http.get("/v1/schemes").expect(200); // over the global 120/min, but skipped

    const h = await http.get("/v1/health").expect(200);
    expect(h.body).toMatchObject({ ok: true, db: "up" });
  });
});
