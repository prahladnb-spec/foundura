import { FOUNDER_GUIDES, GUIDE_PATH, guideEntries, guideText } from "../../apps/web/src/founders/guides";
import { SUPPORT } from "../../apps/web/src/support/directory";
import { expect, test } from "./fixtures";

test.describe("founder guides: mentors, co-working, students, women and selling", () => {
  for (const g of FOUNDER_GUIDES) {
    test(`${g} lists its steps and every matching organisation`, async ({ page }) => {
      await page.goto(GUIDE_PATH[g]);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(guideText.en[g].title);
      await expect(page.locator("section[aria-labelledby=steps-h] ol > li")).toHaveCount(guideText.en[g].steps.length);
      const list = page.locator("section[aria-labelledby=list-h]");
      for (const e of guideEntries(g)) await expect(list.getByText(e.name, { exact: true })).toBeVisible();
      // Links to the other four guides, and every guide is in the footer.
      await expect(page.locator("section[aria-labelledby=related-h] li")).toHaveCount(FOUNDER_GUIDES.length - 1);
      await expect(page.locator(`footer a[href="${GUIDE_PATH[g]}"]`)).toHaveCount(1);
    });
  }

  test("co-working shows each workspace offer, grouped by state with a link to the state page", async ({ page }) => {
    await page.goto("/coworking");
    const thub = SUPPORT.find((e) => e.name === "T-Hub")!;
    await expect(page.getByText(thub.desks!)).toBeVisible();
    await expect(page.getByRole("link", { name: "Telangana" })).toHaveAttribute("href", "/states/tg");
  });

  test("selling covers government and large companies", async ({ page }) => {
    await page.goto("/selling");
    await expect(page.getByRole("heading", { name: "Selling to large companies" })).toBeVisible();
    await expect(page.getByText("Shell E4", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Public procurement relaxations and GeM Startup Runway" })).toBeVisible();
  });

  test("Hindi reads the Hindi guide; other languages read the English, marked", async ({ page }) => {
    await page.goto("/hi/women");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(guideText.hi.women.title);
    await expect(page.getByText("WE Hub", { exact: true })).toHaveAttribute("lang", "en");

    await page.goto("/fr/students");
    await expect(page.getByText("Ce guide est en anglais.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(guideText.en.students.title);
    await expect(page.locator("main h1").locator("xpath=ancestor::*[@lang][1]")).toHaveAttribute("lang", "en");
  });

  test("site search finds the guides and the support directory", async ({ page }) => {
    await page.goto("/search?q=co-working");
    await expect(page.getByRole("link", { name: guideText.en.coworking.title })).toBeVisible();
    await page.goto("/search?q=Smart India Hackathon");
    await expect(page.getByRole("link", { name: "Smart India Hackathon" }).first()).toBeVisible();
    await page.goto("/hi/search?q=महिला संस्थापक");
    await expect(page.getByRole("link", { name: guideText.hi.women.title })).toBeVisible();
  });
});
