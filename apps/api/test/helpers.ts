import path from "node:path";
import type { INestApplication } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import request from "supertest";
import { SCHEMES } from "../db/seed-data/schemes";
import { loadConfig } from "../src/config";
import { createDb } from "../src/db/client";
import { schemes } from "../src/db/schema";
import { createApp } from "../src/main";

export const DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://foundura:foundura@localhost:5432/foundura_test";
export const ADMIN_KEY = "test-admin-key-123";
export const ADMIN_EMAIL = "editor@foundura.test";

/** Fresh schema, migrations, seeded schemes, and a running app. */
export async function startTestApp(overrides: Record<string, string> = {}): Promise<{ app: INestApplication; http: ReturnType<typeof request> }> {
  const { db, pool } = createDb(DATABASE_URL);
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
  await migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });
  for (const s of SCHEMES) {
    await db.insert(schemes).values({ ...s, state: s.state ?? null, statusNote: s.statusNote ?? null });
  }
  await pool.end();

  const app = await createApp(
    loadConfig({
      DATABASE_URL,
      JWT_SECRET: "test-secret-test-secret-123",
      ADMIN_API_KEY: ADMIN_KEY,
      ADMIN_EMAILS: `${ADMIN_EMAIL}, other-admin@foundura.test`,
      OTP_DELIVERY: "dev",
      NODE_ENV: "test",
      ...overrides,
    }),
  );
  await app.init();
  return { app, http: request(app.getHttpServer()) };
}

export async function signIn(http: ReturnType<typeof request>, email: string, consents = ["account"]) {
  const r1 = await http.post("/v1/auth/request-otp").send({ email }).expect(200);
  const r2 = await http.post("/v1/auth/verify-otp").send({ email, code: r1.body.devCode, consents }).expect(200);
  return { Authorization: `Bearer ${r2.body.token as string}` };
}
