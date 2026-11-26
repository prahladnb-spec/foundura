import { DICTS } from "../../apps/web/src/i18n/dicts";
import { TILES } from "../../apps/web/src/funding/directory";
import { STATE_TIER } from "../../apps/web/src/states/ranking";
import { SUPPORT } from "../../apps/web/src/support/directory";
import { expect, test } from "./fixtures";

const d = DICTS.en.states;

test.describe("states", () => {
  test("the map links every state and union territory to its page", async ({ page }) => {
    await page.goto("/states");
    await expect(page.locator("h1")).toHaveText(d.title);
    const map = page.getByRole("navigation", { name: d.mapLabel });
    await expect(map.getByRole("link")).toHaveCount(Object.keys(TILES).length);
    await map.getByRole("link", { name: "Karnataka" }).click();
    await expect(page).toHaveURL("/states/ka");
    // India-wide support programmes are on the index page.
    await page.goto("/states");
    await expect(page.locator("section[aria-labelledby=national-h] h3")).toHaveCount(SUPPORT.filter((s) => s.geo === "IN" && s.kind !== "corporate").length);
  });

  test("a state page shows its ranking, schemes, funding, incubators and a scan for that state", async ({ page }) => {
    await page.goto("/states/ka");
    await expect(page.locator("h1")).toHaveText("Startups in Karnataka");
    await expect(page.locator("section[aria-labelledby=rank-h]")).toContainText(`${d.tiers[STATE_TIER.KA!]} in DPIIT's States' Startup Ranking 5.0`);
    await expect(page.locator("section[aria-labelledby=support-h]")).toContainText("NSRCEL");
    await expect(page.locator("section[aria-labelledby=funding-h] a").first()).toHaveAttribute("href", /^\/funding#f-/);
    await expect(page.getByRole("link", { name: d.scan })).toHaveAttribute("href", "/scan?state=KA");
    await page.getByRole("link", { name: d.scan }).click();
    await expect(page.locator("#state")).toHaveValue("KA");
  });

  test("states that weren't ranked say so, and unknown codes are not found", async ({ page }) => {
    await page.goto("/states/wb");
    await expect(page.locator("section[aria-labelledby=rank-h]")).toContainText("did not take part");
    expect((await page.goto("/states/xx"))?.status()).toBe(404);
    expect((await page.goto("/states/KA"))?.status()).toBe(404);
  });

  test("state pages work in Hindi", async ({ page }) => {
    await page.goto("/hi/states/tn");
    await expect(page.locator("h1")).toHaveText("तमिलनाडु के स्टार्टअप");
  });
});
