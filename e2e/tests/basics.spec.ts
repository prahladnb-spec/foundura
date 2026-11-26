import { CHAPTERS } from "../../apps/web/src/basics/chapters";
import { QUIZ_EN, QUIZ_HI } from "../../apps/web/src/basics/quiz";
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

  test("every chapter has three quiz questions in English and Hindi, each with a real answer", () => {
    for (const c of CHAPTERS) {
      for (const quiz of [QUIZ_EN, QUIZ_HI]) {
        const q = quiz[c.slug];
        expect(q, c.slug).toHaveLength(3);
        for (const x of q) expect(x.options[x.answer], `${c.slug}: ${x.q}`).toBeTruthy();
      }
    }
  });

  test("the chapter quiz is checked in the page and says why", async ({ page }) => {
    await page.goto("/basics/valuation");
    const quiz = page.locator("section", { has: page.getByRole("heading", { name: d.quiz.title }) });
    await quiz.getByRole("button", { name: d.quiz.check }).click();
    await expect(quiz.getByRole("alert")).toHaveText(d.quiz.missing);
    const qs = QUIZ_EN.valuation;
    // Right answers to the first two questions, a wrong one to the third.
    for (const [i, x] of qs.entries()) {
      const pick = i < 2 ? x.answer : (x.answer + 1) % x.options.length;
      await quiz.getByRole("group", { name: `${i + 1}. ${x.q}` }).getByRole("radio", { name: x.options[pick] }).check();
    }
    await quiz.getByRole("button", { name: d.quiz.check }).click();
    await expect(quiz.getByRole("status")).toHaveText("2 of 3 right.");
    await expect(quiz).toContainText(qs[2].why);
    await quiz.getByRole("button", { name: d.quiz.retry }).click();
    await expect(quiz.getByRole("radio", { checked: true })).toHaveCount(0);
  });

  test("the team chapter covers vesting and the Indian ESOP rules", async ({ page }) => {
    await page.goto("/basics/team");
    await expect(page.locator("h1")).toHaveText("Building the founding team");
    await expect(page.getByText(/four years with a one-year cliff/).first()).toBeVisible();
    await expect(page.getByText(/up to 10 years from incorporation/)).toBeVisible();
    await expect(page.locator('a[href="/documents/esop-scheme"]')).toBeVisible();
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
