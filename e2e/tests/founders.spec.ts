import { FOUNDER_GUIDES, GUIDE_GROUPS, GUIDE_PATH, guideEntries, guideGroup, guideText } from "../../apps/web/src/founders/guides";
import { SUPPORT } from "../../apps/web/src/support/directory";
import { expect, test } from "./fixtures";

test.describe("founder guides", () => {
  for (const g of FOUNDER_GUIDES) {
    test(`${g} lists its steps and every matching organisation`, async ({ page }) => {
      await page.goto(GUIDE_PATH[g]);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(guideText.en[g].title);
      await expect(page.locator("section[aria-labelledby=steps-h] ol > li")).toHaveCount(guideText.en[g].steps.length);
      const list = page.locator("section[aria-labelledby=list-h]");
      if (!guideEntries(g).length) await expect(list).toHaveCount(0);
      for (const e of guideEntries(g)) await expect(list.getByText(e.name, { exact: true })).toBeVisible();
      // Links to the other guides in its group and to the list of all guides, which the footer links to as the founder handbook.
      await expect(page.locator("section[aria-labelledby=related-h] li")).toHaveCount(guideGroup(g).guides.length - 1);
      await expect(page.locator("section[aria-labelledby=related-h]").getByRole("link", { name: "The whole founder handbook" })).toHaveAttribute("href", "/founder-guides");
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

  test("closing explains strike-off and the fast-track route", async ({ page }) => {
    await page.goto("/closing");
    await expect(page.getByRole("heading", { name: "Strike off a company with no liabilities" })).toBeVisible();
    await expect(page.getByText(/fast-track process, which aims to finish in 90 days/)).toBeVisible();
  });

  test("the founder handbook lists every guide in its group, linked from the footer", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Founder handbook" }).click();
    await expect(page).toHaveURL(/\/founder-guides$/);
    await expect(page.locator("h1")).toHaveText("Founder handbook");
    for (const group of GUIDE_GROUPS) {
      const section = page.locator(`section[aria-labelledby=group-${group.id}]`);
      await expect(section.locator("li")).toHaveCount(group.guides.length);
      for (const g of group.guides) await expect(section.locator(`a[href="${GUIDE_PATH[g]}"]`)).toHaveCount(1);
    }
    expect(GUIDE_GROUPS.flatMap((x) => x.guides).sort()).toEqual([...FOUNDER_GUIDES].sort());

    await page.goto("/hi/founder-guides");
    await expect(page.locator("h1")).toHaveText("संस्थापक पुस्तिका");
    await expect(page.getByRole("link", { name: "कर्मचारी रखना" })).toHaveAttribute("href", "/hi/employees");
  });

  test("rules and paperwork guides carry the deadlines founders miss", async ({ page }) => {
    await page.goto("/foreign-investment");
    await expect(page.getByRole("heading", { name: "Allot within 60 days, report within 30" })).toBeVisible();
    await page.goto("/employees");
    await expect(page.getByText("21 November 2025")).toBeVisible();
    await page.goto("/cyber-security");
    await expect(page.getByRole("heading", { name: "Report to CERT-In within six hours" })).toBeVisible();
    await page.goto("/hi/tax-deductions");
    await expect(page.locator("h1")).toHaveText("हर स्टार्टअप की कर कटौती और भुगतान");
  });

  test("labs lists testing and certification centres, with lab kinds on state pages", async ({ page }) => {
    await page.goto("/labs");
    await expect(page.getByRole("heading", { name: "Find out which certificates you need" })).toBeVisible();
    await expect(page.getByText("STQC test and calibration labs", { exact: true })).toBeVisible();
    await page.goto("/states/kl");
    await expect(page.getByText("Lab or testing centre").first()).toBeVisible();
  });

  test("patents: filing in India, abroad, the deadline timeline and patent offices", async ({ page }) => {
    await page.goto("/patents");
    await expect(page.locator("h1")).toHaveText("Patents for startups, in India and abroad");
    await expect(page.getByRole("heading", { name: "File a provisional application to fix your date" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Get permission before filing abroad" })).toBeVisible();
    const timeline = page.locator("section[aria-labelledby=timeline-h] ol li");
    await expect(timeline).toHaveCount(8);
    await expect(timeline.nth(2)).toContainText("Month 12");
    await expect(page.getByRole("link", { name: "European Patent Office (EPO)" })).toHaveAttribute("href", "https://www.epo.org");
    await expect(page.getByText("hasn't been reviewed by a patent agent")).toBeVisible();

    await page.goto("/hi/patents");
    await expect(page.locator("h1")).toHaveText("स्टार्टअप के लिए पेटेंट, भारत और विदेश में");
    await expect(page.getByRole("heading", { name: "विदेश में आवेदन से पहले अनुमति लें" })).toBeVisible();
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
