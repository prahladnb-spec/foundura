import { createServer, type Server } from "node:http";
import { WEB } from "../playwright.config";
import { expect, test } from "./fixtures";

// A partner's own site on another origin, carrying the published snippet. It is a real local
// server: Chrome blocks pages it can't place on the local network from loading localhost scripts.
const PARTNER = "http://127.0.0.1:3101/";
const PARTNER_PAGES: Record<string, string> = {
  "/": `<!doctype html><html lang="en"><body><h1>Partner incubator</h1><script src="${WEB}/embed.js" data-state="KA" async></script></body></html>`,
  "/hi": `<!doctype html><html lang="hi"><body><script src="${WEB}/embed.js" data-lang="hi" async></script></body></html>`,
  "/frame-home": `<!doctype html><html><body><iframe src="${WEB}/signin" width="800" height="400"></iframe></body></html>`,
};

test.describe("embed widget", () => {
  let partner: Server;
  test.beforeAll(async () => {
    partner = createServer((req, res) => {
      const body = PARTNER_PAGES[req.url ?? ""];
      res.writeHead(body ? 200 : 404, { "Content-Type": "text/html" }).end(body ?? "");
    });
    await new Promise<void>((r) => partner.listen(3101, "127.0.0.1", r));
  });
  test.afterAll(() => new Promise<void>((r) => partner.close(() => r())));

  test("works on a partner site and resizes to fit", async ({ page }) => {
    await page.goto(PARTNER);
    const frameEl = page.locator("iframe");
    await expect(frameEl).toHaveAttribute("title", "Foundura Scheme Scan");
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("#state")).toHaveValue("KA");

    const before = (await frameEl.boundingBox())!.height;
    await frame.locator('button[type="submit"]').click();
    await expect(frame.locator("#results-h")).toBeVisible();
    await expect.poll(async () => (await frameEl.boundingBox())!.height).toBeGreaterThan(before);
    // Links open on Foundura in a new tab rather than inside the partner's page.
    await expect(frame.locator("#results-h ~ ol a").first()).toHaveAttribute("target", "_blank");
  });

  test("Hindi widget", async ({ page }) => {
    await page.goto(`${PARTNER}hi`);
    await expect(page.locator("iframe")).toHaveAttribute("src", `${WEB}/hi/embed/scan`);
    await expect(page.frameLocator("iframe").locator("html")).toHaveAttribute("lang", "hi-IN");
  });

  test("the rest of the site can't be framed by another site", async ({ page }) => {
    await page.goto(`${PARTNER}frame-home`);
    await page.waitForLoadState("load");
    const framed = page.frames().find((f) => f !== page.mainFrame())!;
    // Chrome swaps a refused frame for its own error page, so the sign-in form never loads.
    await expect.poll(() => framed.locator('input[type="email"]').count()).toBe(0);
    expect(framed.url()).not.toBe(`${WEB}/signin`);
  });

  test("only the widget may be framed", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
    expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    for (const path of ["/embed/scan", "/hi/embed/scan"]) {
      const embed = await request.get(path);
      expect(embed.headers()["x-frame-options"], path).toBeUndefined();
      expect(embed.headers()["content-security-policy"], path).toContain("frame-ancestors *");
      expect(embed.headers()["set-cookie"], path).toBeUndefined();
    }
  });
});

test.describe("MedTech guide", () => {
  const steps = (page: import("@playwright/test").Page) => page.locator("#finder-h ~ div ol li p.text-lg");

  test("the pathway changes with the goal and the device class", async ({ page }) => {
    await page.goto("/sectors/medtech");
    await expect(page.locator("h1")).toContainText(/medtech|medical device/i);

    await page.locator("label", { hasText: "Ready to make and sell in India" }).click();
    await page.locator("label", { hasText: "Class C (moderate to high)" }).click();
    const makeC = await steps(page).allInnerTexts();
    expect(makeC.join(" | ")).toMatch(/CDSCO/);

    await page.locator("label", { hasText: "Class A, not sterile and no measuring function" }).click();
    const makeA = await steps(page).allInnerTexts();
    expect(makeA).not.toEqual(makeC);
    expect(makeA.length).toBeLessThan(makeC.length);

    await page.locator("label", { hasText: "Importing a device to sell" }).click();
    await page.locator("label", { hasText: "Class B (low to moderate)" }).click();
    expect((await steps(page).allInnerTexts()).join(" | ")).toMatch(/import/i);

    // The funding list links to scheme pages, and the scan link pre-selects MedTech.
    await expect(page.locator("section[aria-labelledby=money-h] ul li a").first()).toHaveAttribute("href", /^\/schemes\//);
    await page.getByRole("link", { name: "Check which ones you qualify for" }).click();
    await expect(page).toHaveURL(/\/scan\?.*sector=medtech/);
    await expect(page.locator('button[aria-pressed="true"]', { hasText: "MedTech / Medical devices" })).toBeVisible();
  });

  test("works in Hindi", async ({ page }) => {
    await page.goto("/hi/sectors/medtech");
    await expect(page.locator("h1")).toContainText(/[ऀ-ॿ]/);
    await page.locator("label", { hasText: "भारत में बनाकर बेचने के लिए तैयार" }).click();
    await page.locator("label", { hasText: "क्लास B (कम से मध्यम)" }).click();
    await expect(steps(page).first()).toContainText(/[ऀ-ॿ]/);
    await expect(page.locator("footer a", { hasText: /मेडटेक/ })).toBeVisible();
  });
});

test.describe("search engines and monitoring", () => {
  test("robots and sitemap", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    for (const path of ["/admin", "/dashboard", "/api/", "/embed/"]) expect(robots).toContain(`Disallow: ${path}`);
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<urlset");
    expect(sitemap).toContain("/schemes/dpiit-startup-recognition</loc>");
    expect(sitemap).toMatch(/hreflang="hi-IN"\s+href="[^"]*\/hi\/schemes\/dpiit-startup-recognition"/);
    // Private pages never appear.
    expect(sitemap).not.toContain("/dashboard");
    expect(sitemap).not.toContain("/admin");
  });

  test("pages carry share images and structured data", async ({ page, request }) => {
    await page.goto("/schemes/dpiit-startup-recognition");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(ld["@context"]).toBe("https://schema.org");

    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toBeTruthy();
    const img = await request.get(new URL(og!).pathname);
    expect(img.status()).toBe(200);
    expect(img.headers()["content-type"]).toBe("image/png");
  });

  test("health check reports the web app, API and database", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ web: "up", api: "up", db: "up" });
  });
});
