import { expect, test } from "./fixtures";

test.describe("illustrations and infographics", () => {
  test("pages carry their illustration, hidden from screen readers", async ({ page }) => {
    for (const [path, art] of [["/scan", "scan"], ["/schemes", "schemes"], ["/events", "events"], ["/documents", "documents"], ["/hi/learn", "learn"]]) {
      await page.goto(path);
      const img = page.locator(`img[src="/art/${art}.svg"]`);
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    await page.goto("/");
    await expect(page.locator(".hero-file img")).toHaveCount(5);
    for (const img of await page.locator(".hero-file img").all()) await expect(img).toHaveAttribute("alt", "");
  });

  test("the scheme tile map links each state to its list and counts schemes by type", async ({ page }) => {
    await page.goto("/schemes");
    const map = page.getByRole("navigation", { name: "States and union territories with schemes" });
    const karnataka = map.getByRole("link", { name: /^KA ?, Karnataka: 1 state scheme$/ });
    await karnataka.click();
    await expect(page).toHaveURL(/#state-KA$/);
    await expect(page.locator("#state-KA h2")).toHaveText("Karnataka");
    // States without their own schemes are shown pale and aren't links.
    await expect(map.getByRole("link", { name: /^RJ/ })).toHaveCount(0);
    await expect(page.locator("#map-h ~ p a[href='#central']")).toContainText(/\d+ central schemes apply everywhere/);
    // The type breakdown adds up to every scheme listed.
    const counts = await page.locator("section[aria-labelledby=map-h] ul li > span:last-child").allInnerTexts();
    const listed = await page.locator("main li a[href^='/schemes/']").count();
    expect(counts.map(Number).reduce((a, b) => a + b, 0)).toBe(listed);

    await page.goto("/hi/schemes");
    await expect(page.getByRole("navigation", { name: "योजनाओं वाले राज्य और केंद्र शासित प्रदेश" }).getByRole("link", { name: /^KA ?, कर्नाटक: राज्य की 1 योजना$/ })).toBeVisible();
  });

  test("the step infographics are ordered lists with working links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("list", { name: "How the Scheme Scan works" }).getByRole("listitem")).toHaveCount(3);
    await page.goto("/investors");
    const intro = page.getByRole("list", { name: "How intros work" });
    await expect(intro.getByRole("listitem")).toHaveCount(4);
    await expect(intro).toContainText("Reach a score of 50");
    await page.goto("/learn");
    const journey = page.getByRole("list", { name: "The 8 stages of the startup life cycle" });
    await expect(journey.getByRole("listitem").filter({ has: page.locator("h3") })).toHaveCount(8);
    await expect(page.getByRole("link", { name: "Read the full chapter on the 8 stages" })).toHaveAttribute("href", "/basics/stages");
    await journey.getByRole("link", { name: "DPIIT recognition" }).click();
    await expect(page).toHaveURL(/\/schemes\/dpiit-startup-recognition$/);
    await page.goto("/hi/learn");
    await expect(page.getByRole("list", { name: "स्टार्टअप जीवन चक्र के 8 चरण" }).getByRole("link", { name: "लीन कैनवस" })).toHaveAttribute("href", "/hi/documents/lean-canvas");
  });

  test("template covers: a shelf of the essentials, the cover on each covered template, and on its share image", async ({ page, request }) => {
    await page.goto("/documents");
    const shelf = page.locator("section[aria-labelledby=essentials-h]");
    await expect(shelf.getByRole("listitem")).toHaveCount(12);
    for (const img of await shelf.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    await shelf.getByRole("link", { name: /Financial model/ }).click();
    await expect(page).toHaveURL(/\/documents\/financial-model$/);
    await expect(page.locator('img[src="/art/covers/financial-model.svg"]')).toHaveAttribute("alt", "");

    await page.goto("/hi/documents");
    await expect(page.locator("#essentials-h")).toHaveText("सबसे ज़रूरी");
    await expect(page.locator("section[aria-labelledby=essentials-h]").getByRole("link", { name: /पिच डेक/ })).toHaveAttribute("href", "/hi/documents/pitch-deck");

    // A template without a cover keeps the plain header.
    await page.goto("/documents/relieving-letter");
    await expect(page.locator('img[src^="/art/covers/"]')).toHaveCount(0);

    await page.goto("/documents/term-sheet");
    const og = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
    const img = await request.get(og.pathname + og.search);
    expect(img.status()).toBe(200);
    expect(img.headers()["content-type"]).toBe("image/png");
  });
});
