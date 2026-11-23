import type { Page } from "@playwright/test";
import { LANG_INFO, LANGS, lp } from "../../apps/web/src/i18n/config";
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
      alternates: [...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')].map((l) => [l.hreflang, new URL(l.href).pathname]),
      htmlLang: document.documentElement.lang,
      dir: document.documentElement.dir,
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
    for (const lang of LANGS) {
      const s = langs[lang];
      const path = lp(lang, s.slug);
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
        expect(h.ogLocale).toBe(LANG_INFO[lang].og);
        // Every language version is listed, and the page says which language and direction it is.
        expect(Object.fromEntries(h.alternates)).toEqual({ ...Object.fromEntries(LANGS.map((l) => [LANG_INFO[l].tag, lp(l, s.slug)])), "x-default": s.slug });
        expect(h.htmlLang).toBe(LANG_INFO[lang].tag);
        expect(h.dir).toBe(LANG_INFO[lang].dir);
        expect(h.twitter).toBe("summary_large_image");
        expect(h.h1).toBe(1);
      });
    }
  }

  test("titles, descriptions, canonical and social tags are in the <head> the server sends", async ({ request }) => {
    // Link previews (WhatsApp, LinkedIn) and some crawlers read only the raw <head>, without running scripts.
    const paths = ["/", "/schemes", "/documents/pitch-deck", "/events", "/glossary"];
    for (const l of LANGS) {
      for (const p of l === "en" || l === "hi" ? paths : [paths[0]]) {
        const html = await (await request.get(lp(l, p))).text();
        const headHtml = html.slice(0, html.indexOf("</head>"));
        for (const tag of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:title"']) {
          expect(headHtml, `${lp(l, p)} ${tag}`).toContain(tag);
        }
      }
    }
  });

  test("main page titles and descriptions are all different", () => {
    for (const lang of LANGS) {
      const all = Object.values(SEO).map((p) => p[lang]);
      expect(new Set(all.map((p) => p.title)).size).toBe(all.length);
      expect(new Set(all.map((p) => p.description)).size).toBe(all.length);
      expect(new Set(all.map((p) => p.focus)).size).toBe(all.length);
    }
  });

  for (const path of ["/schemes/startup-india-seed-fund", "/hi/schemes/startup-india-seed-fund", "/documents/pitch-deck", "/hi/documents/founders-agreement", "/learn/dpiit-recognition-2026-rules", "/es/documents/cap-table", "/de/schemes/startup-india-seed-fund", "/ar/documents/pitch-deck", "/he/investors"]) {
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
