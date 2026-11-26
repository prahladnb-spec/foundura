import { expect, test } from "./fixtures";
import { GUIDES_2026_11 } from "../../apps/api/db/seed-data/guides-2026-11";

test.describe("founder guides", () => {
  test("the guides page has a start here list, topics and a way to write for us", async ({ page }) => {
    await page.goto("/learn");
    const main = page.getByRole("main");
    await expect(main).not.toContainText("every day");
    const start = page.locator("section", { has: page.locator("#start-h") });
    await expect(start.getByRole("link")).toHaveCount(3);
    await expect(start.getByRole("link").first()).toHaveAttribute("href", "/learn/startup-idea-problem-first");
    for (const topic of ["Starting up", "Product and customers", "Selling", "Funding", "Team and hiring", "Registration, tax and law"]) {
      await expect(page.getByRole("heading", { level: 3, name: topic })).toBeVisible();
    }
    await expect(page.locator("#topic-legal")).toContainText("GST registration for startups");
    await expect(main.getByRole("link", { name: "Email us" })).toHaveAttribute("href", /^mailto:.*subject=Guide%20idea/);
    for (const g of GUIDES_2026_11) await expect(main.getByRole("link", { name: g.title, exact: true }).first()).toBeVisible();
  });

  test("a guide shows its byline, a disclaimer and more on the topic", async ({ page }) => {
    await page.goto("/learn/gst-registration-for-startups");
    const main = page.getByRole("main");
    await expect(main).toContainText("By the Foundura editors");
    await expect(main).toContainText("General information, not legal, tax or financial advice.");
    const more = page.locator("section", { has: page.locator("#more-h") });
    await expect(more.getByRole("link")).not.toHaveCount(0);
    await expect(more.getByRole("link", { name: "GST registration for startups: when you need it and how it works" })).toHaveCount(0);
  });

  test("the software and SaaS guide links schemes, templates and guides", async ({ page }) => {
    await page.goto("/sectors/software");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Building a software or SaaS company in India");
    await expect(page.locator("#steps-h ~ ol > li")).toHaveCount(9);
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "DPIIT Startup Recognition", exact: false }).first()).toBeVisible();
    await expect(main.getByRole("link", { name: "Data processing agreement", exact: false }).first()).toHaveAttribute("href", "/documents/data-processing-agreement");
    await expect(main.getByRole("link", { name: /The DPDP Act for startups/ })).toHaveAttribute("href", "/learn/dpdp-act-for-startups");
    await page.goto("/hi/sectors/software");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("भारत में सॉफ़्टवेयर या SaaS कंपनी बनाना");
    await page.goto("/ta/sectors/software");
    await expect(page.locator("main [lang=en] h1")).toHaveText("Building a software or SaaS company in India");
  });
});
