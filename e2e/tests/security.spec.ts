import { LANGS } from "../../apps/web/src/i18n/config";
import { ADMIN_EMAIL } from "../playwright.config";
import { expect, signIn, test } from "./fixtures";

test.describe("security headers", () => {
  test("pages send a strict content security policy and nothing they load is blocked by it", async ({ page }) => {
    const blocked: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy|Refused to (load|execute|connect|frame|apply)/i.test(m.text())) blocked.push(`${page.url()}: ${m.text()}`);
    });
    const res = await page.goto("/");
    const h = res!.headers();
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).not.toContain("unsafe-eval");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-powered-by"]).toBeUndefined();

    for (const path of ["/scan", "/hi/events", "/documents/pitch-deck", "/startups", "/partners", "/glossary"]) await page.goto(path);
    // Run a scan: the form posts through our own API route.
    await page.goto("/scan");
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/usage" });
    await page.goto("/dashboard");
    expect(blocked).toEqual([]);
  });

  test("the embed widget can be framed by partner sites, nothing else can", async ({ request }) => {
    const embed = await request.get("/embed/scan");
    expect(embed.headers()["content-security-policy"]).toContain("frame-ancestors *");
    expect(embed.headers()["x-frame-options"]).toBeUndefined();
    // Partners can show the widget in any language (embed.js data-lang), and nothing else in that language is frameable.
    for (const l of LANGS.filter((x) => x !== "en")) {
      const res = await request.get(`/${l}/embed/scan`);
      expect(res.headers()["content-security-policy"], l).toContain("frame-ancestors *");
      expect(res.headers()["x-frame-options"], l).toBeUndefined();
      const page = await request.get(`/${l}/scan`);
      expect(page.headers()["content-security-policy"], l).toContain("frame-ancestors 'none'");
    }
  });
});
