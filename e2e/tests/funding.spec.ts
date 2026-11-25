import { DICTS } from "../../apps/web/src/i18n/dicts";
import { FUNDING, fundingId, TILES } from "../../apps/web/src/funding/directory";
import { expect, test } from "./fixtures";

const en = DICTS.en.funding;

test.describe("funding directory", () => {
  test("lists every entry, grouped by place, with the unchecked notice", async ({ page }) => {
    await page.goto("/funding");
    await expect(page.locator("h1")).toHaveText(en.title);
    await expect(page.locator("[data-entry]")).toHaveCount(FUNDING.length);
    await expect(page.locator("#funding-count")).toHaveText(`Showing all ${FUNDING.length}.`);
    await expect(page.getByText(/not yet checked by our team/)).toBeVisible();
    // A government entry that is also a Foundura scheme links to it.
    const sisfs = page.locator("tr", { hasText: "Startup India Seed Fund Scheme (SISFS)" });
    await expect(sisfs.getByRole("link", { name: en.schemeLink })).toHaveAttribute("href", "/schemes/startup-india-seed-fund");
    await expect(sisfs.getByText(en.statuses.closed)).toBeVisible();
  });

  test("the map, type buttons, status menu and search filter the list", async ({ page }) => {
    await page.goto("/funding");
    const visible = page.locator("[data-entry]:visible");
    const ka = FUNDING.filter((e) => e.geo === "KA").length;

    await page.getByRole("button", { name: /Karnataka: / }).click();
    await expect(visible).toHaveCount(ka);
    await expect(page.getByRole("heading", { name: /^Karnataka/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^India-wide/ })).toBeHidden();
    await expect(page.locator("#funding-count")).toHaveText(`Showing ${ka} of ${FUNDING.length}.`);

    // Tap the same state again to see everything.
    await page.getByRole("button", { name: /Karnataka: / }).click();
    await expect(visible).toHaveCount(FUNDING.length);

    await page.getByRole("button", { name: /^United States/ }).click();
    await expect(visible).toHaveCount(FUNDING.filter((e) => e.geo === "US").length);
    await page.getByRole("button", { name: en.clear }).click();

    await page.locator("[data-kind-btn=angel]").click();
    await expect(visible).toHaveCount(FUNDING.filter((e) => e.kind === "angel").length);
    await page.locator("[data-kind-btn='']").click();

    await page.locator("#funding-status").selectOption("closed");
    await expect(visible).toHaveCount(FUNDING.filter((e) => e.status === "closed").length);
    await page.locator("#funding-status").selectOption("");

    await page.locator("#funding-q").fill("tanseed");
    await expect(visible.first()).toContainText("TANSEED");
    await page.locator("#funding-q").fill("zzzz nothing");
    await expect(page.locator("#funding-empty")).toBeVisible();
    await page.getByRole("button", { name: en.clear }).click();
    await expect(visible).toHaveCount(FUNDING.length);
  });

  test("states without entries can't be picked and are listed as not covered", async ({ page }) => {
    await page.goto("/funding");
    const uncovered = Object.keys(TILES).filter((code) => !FUNDING.some((e) => e.geo === code));
    await expect(page.locator("button.funding-tile:disabled")).toHaveCount(uncovered.length);
    await expect(page.getByRole("heading", { name: uncovered.length ? en.gapsTitle : en.moreTitle })).toBeVisible();
  });

  test("every entry has a link to report a change by email", async ({ page }) => {
    await page.goto("/funding");
    const reports = page.locator("[data-entry] a[href^='mailto:']");
    await expect(reports).toHaveCount(FUNDING.length);
    const first = FUNDING[0]!;
    const href = await page.locator(`#${fundingId(first)} a[href^='mailto:']`).getAttribute("href");
    expect(href?.endsWith(`?subject=${encodeURIComponent(`Funding directory: ${first.name}`)}`)).toBe(true);
  });

  test("in Hindi the interface is translated and the entries are marked English", async ({ page }) => {
    await page.goto("/hi/funding");
    await expect(page.locator("h1")).toHaveText(DICTS.hi.funding.title);
    await expect(page.locator("[data-entry] td[lang=en]").first()).toBeVisible();
    await expect(page.getByText(DICTS.hi.funding.inEnglish)).toBeVisible();
  });

  test("site search finds directory entries and the investors page links here", async ({ page }) => {
    await page.goto("/search?q=tanseed");
    await page.getByRole("link", { name: "TANSEED" }).first().click();
    await expect(page).toHaveURL(/\/funding#f-tanseed$/);
    await page.goto("/investors");
    await page.getByRole("main").getByRole("link", { name: DICTS.en.investors.directoryLink, exact: true }).click();
    await expect(page).toHaveURL(/\/funding$/);
  });
});
