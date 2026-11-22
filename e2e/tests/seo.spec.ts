import type { Page } from "@playwright/test";
import { SEO } from "../../apps/web/src/seo";
import { expect, test } from "./fixtures";

const chars = (s: string) => [...s].length;

async function head(page: Page) {
  return page.evaluate(() => {
    const meta = (sel: string) => document.querySelector<HTMLMetaElement>(sel)?.content ?? null;
    const link = (sel: string) => document.querySelector<HTMLLinkElement>(sel)?.getAttribute("href") ?? null;
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      keywords: meta('meta[name="keywords"]'),
      canonical: link('link[rel="canonical"]'),
      en: link('link[rel="alternate"][hreflang="en-IN"]'),
      hi: link('link[rel="alternate"][hreflang="hi-IN"]'),
      xDefault: link('link[rel="alternate"][hreflang="x-default"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogUrl: meta('meta[property="og:url"]'),
      ogLocale: meta('meta[property="og:locale"]'),
      twitter: meta('meta[name="twitter:card"]'),
      h1: document.querySelectorAll("h1").length,
    };
  });
}

test.describe("search engine details", () => {
  for (const [key, langs] of Object.entries(SEO)) {
    for (const lang of ["en", "hi"] as const) {
      const s = langs[lang];
      const path = lang === "hi" ? (s.slug === "/" ? "/hi" : `/hi${s.slug}`) : s.slug;
      test(`${key} (${lang}) has its SEO title, description, keywords and alternates`, async ({ page }) => {
        await page.goto(path);
        const h = await head(page);
        expect(h.title).toBe(s.title);
        expect(chars(h.title)).toBeLessThanOrEqual(60);
        expect(h.description).toBe(s.description);
        expect(chars(h.description!)).toBeGreaterThanOrEqual(120);
        expect(chars(h.description!)).toBeLessThanOrEqual(160);
        expect(h.keywords!.split(",").map((k) => k.trim())).toEqual(s.keywords);
        expect(h.keywords!.split(",")).toHaveLength(15);
        expect(s.excerpt.split(/\s+/).length).toBeLessThanOrEqual(50);
        expect(h.title.toLowerCase()).toContain(s.focus.toLowerCase());
        expect(h.description!.toLowerCase()).toContain(s.focus.toLowerCase());
        expect(new URL(h.canonical!).pathname).toBe(path);
        expect(new URL(h.en!).pathname).toBe(s.slug);
        expect(new URL(h.hi!).pathname).toBe(s.slug === "/" ? "/hi" : `/hi${s.slug}`);
        expect(h.xDefault).toBe(h.en);
        expect(h.ogTitle).toBe(s.title);
        expect(h.ogDescription).toBe(s.excerpt);
        expect(h.ogUrl).toBe(h.canonical);
        expect(h.ogLocale).toBe(lang === "hi" ? "hi_IN" : "en_IN");
        expect(h.twitter).toBe("summary_large_image");
        expect(h.h1).toBe(1);
      });
    }
  }

  test("main page titles and descriptions are all different", () => {
    for (const lang of ["en", "hi"] as const) {
      const all = Object.values(SEO).map((p) => p[lang]);
      expect(new Set(all.map((p) => p.title)).size).toBe(all.length);
      expect(new Set(all.map((p) => p.description)).size).toBe(all.length);
      expect(new Set(all.map((p) => p.focus)).size).toBe(all.length);
    }
  });

  for (const path of ["/schemes/startup-india-seed-fund", "/hi/schemes/startup-india-seed-fund", "/documents/pitch-deck", "/hi/documents/founders-agreement", "/learn/dpiit-recognition-2026-rules"]) {
    test(`detail page ${path} gets generated SEO details within the limits`, async ({ page }) => {
      await page.goto(path);
      const h = await head(page);
      expect(chars(h.title)).toBeLessThanOrEqual(60);
      expect(h.title).toMatch(/\| Foundura$/);
      expect(chars(h.description!)).toBeGreaterThanOrEqual(70);
      expect(chars(h.description!)).toBeLessThanOrEqual(160);
      const kw = h.keywords!.split(",").map((k) => k.trim());
      expect(kw.length).toBeGreaterThanOrEqual(8);
      expect(kw.length).toBeLessThanOrEqual(15);
      expect(new URL(h.canonical!).pathname).toBe(path);
      expect(h.hi).toBeTruthy();
      expect(h.h1).toBe(1);
    });
  }

  test("a guide uses the SEO fields its editor wrote", async ({ page }) => {
    await page.goto("/learn/dpiit-recognition-2026-rules");
    const h = await head(page);
    expect(h.title).toBe("DPIIT recognition 2026: who qualifies now | Foundura");
    expect(h.description).toContain("₹200 crore turnover limit");
    expect(h.keywords).toContain("how to get DPIIT recognition");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((j) => j.includes('"keywords":"DPIIT recognition,'))).toBe(true);
  });
});
