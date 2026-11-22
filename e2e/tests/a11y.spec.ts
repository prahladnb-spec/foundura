import AxeBuilder from "@axe-core/playwright";
import { ADMIN_EMAIL } from "../playwright.config";
import type { Page } from "@playwright/test";
import { expect, signIn, test } from "./fixtures";

const PAGES = [
  "/",
  "/scan",
  "/schemes",
  "/schemes/startup-india-seed-fund",
  "/startups",
  "/investors",
  "/events",
  "/events?view=list",
  "/documents",
  "/documents/pitch-deck",
  "/glossary",
  "/search",
  "/search?q=seed+fund",
  "/learn",
  "/policy",
  "/signin",
  "/privacy",
];

async function expectNoSeriousProblems(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const bad = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${page.url()} ${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join("\n  ")}`);
  expect(bad, bad.join("\n")).toEqual([]);
}

// The other languages share the layouts; check the main ones in each, including right to left.
const INTL_PAGES = ["/", "/scan", "/schemes", "/documents/pitch-deck", "/glossary", "/search?q=seed+fund"];
for (const lang of ["/es", "/de", "/ar", "/he"]) {
  for (const path of INTL_PAGES) {
    const url = `${lang}${path === "/" ? "" : path}`;
    test(`no serious accessibility problems on ${url}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const res = await page.goto(url);
      expect(res?.status(), url).toBeLessThan(400);
      await expectNoSeriousProblems(page);
    });
  }
}

for (const lang of ["", "/hi"]) {
  for (const path of PAGES) {
    const url = `${lang}${path === "/" && lang ? "" : path}`;
    test(`no serious accessibility problems on ${url || "/"}`, async ({ page }) => {
      // Entrance animations would be caught half-faded; the settled colours are what is checked.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const res = await page.goto(url || "/");
      expect(res?.status(), url).toBeLessThan(400);
      await expectNoSeriousProblems(page);
    });
  }
}

test("no serious accessibility problems on the dashboard and editor pages", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page, ADMIN_EMAIL);
  for (const path of ["/dashboard", "/hi/dashboard", "/admin", "/admin/schemes", "/admin/events", "/admin/startups", "/admin/usage", "/admin/audit"]) {
    await page.goto(path);
    await expectNoSeriousProblems(page);
  }
});
