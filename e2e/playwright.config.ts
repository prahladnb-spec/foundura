import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for Foundura. They start the built API and web app on their own ports against a
 * fresh database (E2E_DATABASE_URL), so they never touch dev data.
 *
 *   pnpm build && pnpm e2e
 *
 * Locally, set CHROME_PATH to use an installed Chrome instead of Playwright's download.
 */
export const API = "http://localhost:4100";
export const WEB = "http://localhost:3100";
export const ADMIN_KEY = "e2e-admin-key-0123456789abcdef";
export const ADMIN_EMAIL = "editor@foundura.test";
export const DATABASE_URL = process.env.E2E_DATABASE_URL ?? "postgresql://foundura:foundura@localhost:5432/foundura_e2e";

export const JWT_SECRET = "e2e-jwt-secret-0123456789abcdef";

const apiEnv = {
  DATABASE_URL,
  API_PORT: "4100",
  JWT_SECRET,
  ADMIN_API_KEY: ADMIN_KEY,
  ADMIN_EMAILS: ADMIN_EMAIL,
  OTP_DELIVERY: "dev",
  TRUST_PROXY: "1",
  CORS_ORIGINS: WEB,
  SITE_URL: WEB,
  NODE_ENV: "test",
};

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: WEB,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 900 },
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: [
    {
      // Fresh schema, migrations and seed data, then the API.
      command: "node scripts/reset-db.mjs && node ../apps/api/dist/db/migrate.js && node ../apps/api/dist/db/seed.js && node ../apps/api/dist/src/main.js",
      url: `${API}/v1/health`,
      env: apiEnv,
      timeout: 120_000,
      reuseExistingServer: false,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      // Fresh database each run, so drop any data the last run cached.
      command: "rm -rf ../apps/web/.next/standalone/apps/web/.next/cache && pnpm --filter @foundura/web start",
      url: `${WEB}/robots.txt`,
      env: { PORT: "3100", HOSTNAME: "0.0.0.0", API_URL: API, NODE_ENV: "production" },
      timeout: 120_000,
      reuseExistingServer: false,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
