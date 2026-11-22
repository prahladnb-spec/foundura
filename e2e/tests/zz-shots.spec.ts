import { test } from "@playwright/test";
const PAGES = (process.env.SHOT_PAGES ?? "/,/scan,/schemes,/startups,/investors,/events,/documents,/learn,/policy,/glossary").split(",");
for (const p of PAGES) {
  test(`shot ${p}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: Number(process.env.SHOT_W ?? 1280), height: 900 });
    await page.goto(`http://localhost:3100${p}`);
    await page.evaluate(() => document.fonts.ready);
    const name = p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "");
    await page.screenshot({ path: `/tmp/shots/${process.env.SHOT_PREFIX ?? ""}${name}.png`, fullPage: process.env.SHOT_FULL === "1" });
  });
}
