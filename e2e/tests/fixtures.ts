import { type APIRequestContext, type Browser, type Page, request, test as base, expect } from "@playwright/test";
import { createHmac } from "node:crypto";
import pg from "pg";
import { ADMIN_KEY, API, DATABASE_URL, JWT_SECRET, WEB } from "../playwright.config";

export { expect };

let ipCounter = Math.floor(Math.random() * 200);
/** A made-up visitor IP. The web server forwards the last X-Forwarded-For entry to the API, which rate-limits per IP. */
export function visitorIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `198.51.${Math.floor(Math.random() * 250) + 1}.${ipCounter + 1}`;
}

/** A fresh browser session that looks like its own visitor. */
export async function newVisitor(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({ baseURL: WEB, extraHTTPHeaders: { "x-forwarded-for": visitorIp() }, viewport: { width: 1280, height: 900 } });
  return ctx.newPage();
}

export const test = base.extend<{ admin: APIRequestContext }>({
  page: async ({ page }, use) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": visitorIp() });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await use(page);
    expect(errors, "uncaught errors in the page").toEqual([]);
  },
  /** Direct API access with the admin key, for setup steps such as verifying an investor. */
  admin: async ({}, use) => {
    const ctx = await request.newContext({ baseURL: `${API}/v1/`, extraHTTPHeaders: { "x-admin-key": ADMIN_KEY } });
    await use(ctx);
    await ctx.dispose();
  },
});

export const uniqueEmail = (name: string) => `${name}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

/**
 * Sign in through the real form (dev mode shows the code on screen). `consents` are the
 * checkbox labels to tick; "account" is ticked for new accounts unless `skipAccount`.
 */
export async function signIn(page: Page, email: string, opts: { path?: string; consents?: RegExp[] } = {}) {
  await page.goto(opts.path ?? "/signin");
  await page.getByRole("main").locator('input[type="email"]').fill(email);
  await page.getByRole("main").locator("form button").first().click();
  const codeInput = page.locator('input[autocomplete="one-time-code"]');
  await expect(codeInput).toBeVisible();
  const code = (await page.locator("strong.tracking-widest").textContent())!.trim();
  await codeInput.fill(code);
  const boxes = page.locator('fieldset input[type="checkbox"]');
  await boxes.first().check();
  for (const label of opts.consents ?? []) await page.locator("fieldset label", { hasText: label }).locator("input").check();
  await Promise.all([page.waitForURL((u) => !u.pathname.endsWith("/signin")), page.getByRole("main").locator("form button").last().click()]);
}

/** Reads one value straight from the e2e database (for things only an email would carry). */
export async function dbValue<T = string>(sql: string, params: unknown[]): Promise<T | undefined> {
  const c = new pg.Client({ connectionString: DATABASE_URL });
  await c.connect();
  try {
    const { rows } = await c.query(sql, params);
    return rows[0] ? (Object.values(rows[0])[0] as T) : undefined;
  } finally {
    await c.end();
  }
}

/** Runs one statement against the e2e database (test set-up only). */
export async function dbExec(sql: string, params: unknown[]): Promise<void> {
  const c = new pg.Client({ connectionString: DATABASE_URL });
  await c.connect();
  try {
    await c.query(sql, params);
  } finally {
    await c.end();
  }
}

/** The link the weekly email carries, built the same way the API signs it. */
export async function unsubscribeLink(email: string): Promise<string> {
  const uid = await dbValue("select id from users where email = $1", [email]);
  if (!uid) throw new Error(`No user ${email}`);
  const t = createHmac("sha256", JWT_SECRET).update(`unsubscribe:${uid}`).digest("base64url");
  return `/unsubscribe?u=${uid}&t=${t}`;
}

