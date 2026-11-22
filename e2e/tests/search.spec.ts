import { dbValue, expect, test } from "./fixtures";
import { en } from "../../apps/web/src/i18n/en";
import { hi } from "../../apps/web/src/i18n/hi";
import { es } from "../../apps/web/src/i18n/es";
import { de } from "../../apps/web/src/i18n/de";
import { ar } from "../../apps/web/src/i18n/ar";
import { he } from "../../apps/web/src/i18n/he";

const count = (key: string) =>
  dbValue<number>("select coalesce(sum(count), 0)::int as v from daily_counts where metric = 'search' and key = $1", [key]);

test.describe("site search", () => {
  test("search from the header, filter by kind, open a result", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    await page.getByLabel("What are you looking for?").fill("seed fund");
    await page.getByRole("search").getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/search\?q=seed\+fund$/);
    await expect(page.locator("#results-h")).toHaveText(/\d+ results for “seed fund”/);
    // The scheme named for it comes first.
    await expect(page.locator("ol > li h3").first()).toHaveText(/Seed Fund Scheme/);

    const filters = page.getByRole("navigation", { name: "Show" });
    await filters.getByRole("link", { name: /^Glossary/ }).click();
    await expect(page).toHaveURL(/type=term/);
    await expect(filters.getByRole("link", { name: /^Glossary/ })).toHaveAttribute("aria-current", "page");
    await page.locator("ol > li a").first().click();
    await expect(page).toHaveURL(/\/glossary#seed-round$/);
    await expect(page.locator("#seed-round")).toBeInViewport();
  });

  test("finds Hindi and English text from either page", async ({ page }) => {
    await page.goto("/hi/search?q=" + encodeURIComponent("पिच डेक"));
    await expect(page.locator("ol > li h3 a").first()).toHaveAttribute("href", "/hi/documents/pitch-deck");
    await page.goto("/hi/search?q=pitch+deck");
    await expect(page.locator("ol > li h3").first()).toHaveText("पिच डेक");
    await page.goto("/search?q=" + encodeURIComponent("पिच डेक"));
    await expect(page.locator("ol > li h3").first()).toHaveText("Pitch deck");
  });

  test("every popular search finds something", async ({ page }) => {
    // Six languages times eight searches.
    test.slow();
    for (const [lang, d] of [["", en], ["/hi", hi], ["/es", es], ["/de", de], ["/ar", ar], ["/he", he]] as const) {
      for (const q of d.search.popularItems) {
        await page.goto(`${lang}/search?q=${encodeURIComponent(q)}`);
        await expect(page.locator("ol > li").first(), `${lang || "/"} ${q}`).toBeVisible();
      }
    }
  });

  test("nothing found points somewhere useful, and only the outcome is counted", async ({ page }) => {
    const none = (await count("none")) ?? 0;
    const found = (await count("found")) ?? 0;
    await page.goto("/search?q=zzqxv");
    await expect(page.locator("#results-h")).toHaveText("Nothing matches “zzqxv”.");
    await expect(page.getByRole("link", { name: "Check which schemes fit your startup" })).toHaveAttribute("href", "/scan");
    await expect.poll(() => count("none")).toBe(none + 1);
    await page.goto("/search?q=esop");
    await expect.poll(() => count("found")).toBe(found + 1);
    // The words searched for are never stored.
    expect(await dbValue<number>("select count(*)::int as v from daily_counts where key like '%zzqxv%' or key like '%esop%'", [])).toBe(0);
  });
});
