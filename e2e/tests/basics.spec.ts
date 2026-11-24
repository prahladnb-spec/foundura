import { CHAPTERS } from "../../apps/web/src/basics/chapters";
import { DICTS } from "../../apps/web/src/i18n/dicts";
import { expect, test } from "./fixtures";

const d = DICTS.en.basics;

test.describe("funding basics", () => {
  test("the course page lists every chapter in order", async ({ page }) => {
    await page.goto("/basics");
    await expect(page.locator("h1")).toHaveText(d.title);
    const titles = page.locator("section[aria-labelledby=ch-h] h3");
    await expect(titles).toHaveCount(CHAPTERS.length);
    await expect(titles.first()).toHaveText(CHAPTERS[0].en.title);
    await page.getByRole("link", { name: d.start }).click();
    await expect(page).toHaveURL(`/basics/${CHAPTERS[0].slug}`);
  });

  test("chapters link forward and back, to the glossary and to templates", async ({ page }) => {
    await page.goto("/basics/equity");
    await expect(page.locator("h1")).toHaveText(CHAPTERS.find((c) => c.slug === "equity")!.en.title);
    await expect(page.getByRole("link", { name: "CCPS" })).toHaveAttribute("href", "/glossary#ccps");
    await expect(page.locator('a[href="/documents/convertible-note"]')).toBeVisible();
    await page.getByRole("link", { name: new RegExp(d.next) }).click();
    await expect(page).toHaveURL("/basics/debt");
    await page.getByRole("link", { name: new RegExp(d.prev) }).click();
    await expect(page).toHaveURL("/basics/equity");
    await expect(page.getByText(/not financial, legal or tax advice/)).toBeVisible();
  });

  test("every chapter page loads", async ({ page }) => {
    for (const c of CHAPTERS) {
      const res = await page.goto(`/basics/${c.slug}`);
      expect(res?.status(), c.slug).toBe(200);
      await expect(page.locator("h1")).toHaveText(c.en.title);
    }
    expect((await page.goto("/basics/no-such-chapter"))?.status()).toBe(404);
  });

  test("the dilution calculator works out who owns what", async ({ page }) => {
    await page.goto("/basics/valuation");
    // Defaults: ₹16 crore pre-money, ₹4 crore raised, founders 85%, new pool 10%.
    const row = (label: string) => page.locator("#calc-h ~ div dl div", { hasText: label }).locator("dd");
    await expect(row(d.calc.investors)).toHaveText("20%");
    await expect(row(d.calc.foundersAfter)).toHaveText("59.5%");
    await expect(row(d.calc.poolAfter)).toHaveText("10%");
    await page.locator("#calc-pool").fill("0");
    await expect(row(d.calc.foundersAfter)).toHaveText("68%");
    await page.locator("#calc-raise").fill("0");
    await expect(page.getByText(d.calc.invalid)).toBeVisible();
  });

  test("Hindi pages show the Hindi chapters; other languages show the English marked as such", async ({ page }) => {
    await page.goto("/hi/basics/grants");
    await expect(page.locator("h1")).toHaveText(CHAPTERS.find((c) => c.slug === "grants")!.hi.title);
    await page.goto("/ta/basics/grants");
    await expect(page.locator("article")).toHaveAttribute("lang", "en");
    await expect(page.getByText(DICTS.ta.basics.inEnglish)).toBeVisible();
  });

  test("site search finds chapters and the funding directory links here", async ({ page }) => {
    await page.goto("/search?q=dilution");
    await expect(page.locator('a[href="/basics/valuation"]').first()).toBeVisible();
    await page.goto("/funding");
    await page.getByRole("main").getByRole("link", { name: d.fundingLink, exact: true }).click();
    await expect(page).toHaveURL("/basics");
  });
});
