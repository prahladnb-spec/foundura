import { ADMIN_EMAIL } from "../playwright.config";
import { dbValue, expect, signIn, test } from "./fixtures";

const count = (metric: string, key: string) =>
  dbValue<number>("select coalesce(sum(count), 0)::int as v from daily_counts where metric = $1 and key = $2", [metric, key]);

test.describe("anonymous usage counts", () => {
  test("page views and template downloads are counted without cookies, and editors can see the totals", async ({ page, context }) => {
    const views = (await count("page_view", "/documents/pitch-deck")) ?? 0;
    await page.goto("/documents/pitch-deck");
    await expect.poll(() => count("page_view", "/documents/pitch-deck")).toBe(views + 1);

    const link = page.locator('a[href^="/downloads/"][href$=".pptx"]').first();
    const key = (await link.getAttribute("href"))!.replace(/^\/downloads\/|\.pptx$/g, "");
    const before = (await count("template_download", key)) ?? 0;
    const download = page.waitForEvent("download");
    await link.click();
    await download;
    await expect.poll(() => count("template_download", key)).toBe(before + 1);

    // Counting sets no cookies and stores nothing in the browser.
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);

    // Private pages aren't counted by path.
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/usage" });
    await expect(page).toHaveURL(/\/admin\/usage$/);
    await expect(page.locator("h1")).toHaveText("Usage");
    await expect(page.locator("main")).toContainText("Template downloads");
    await expect(page.locator("#templates-h ~ table")).toContainText(key);
    expect(await dbValue<number>("select count(*)::int as v from daily_counts where key like '/admin%' or key like '/dashboard%' or key like '/signin%'", [])).toBe(0);
  });
});
