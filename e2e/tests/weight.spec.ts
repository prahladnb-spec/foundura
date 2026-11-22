import { expect, test } from "./fixtures";

/**
 * Page weight budget, measured as compressed bytes sent. Founders often open Foundura on a phone
 * over a patchy connection, so the main pages should stay light.
 */
// Set a little above what the pages weigh today (Nov 2026), so growth gets noticed. Hindi pages
// carry about 390 KB more because Devanagari fonts are bigger.
// Arabic pages carry about 170 KB of Arabic font; Hebrew about 20 KB.
// Languages in other scripts download their own font (Arabic about 170 KB, the Indian scripts 50 to 160 KB).
const BUDGET_KB: Record<string, { script: number; total: number }> = {
  en: { script: 180, total: 400 },
  hi: { script: 180, total: 760 },
  mr: { script: 180, total: 760 },
  ar: { script: 180, total: 620 },
  he: { script: 180, total: 460 },
  kn: { script: 180, total: 600 },
  ta: { script: 180, total: 500 },
  te: { script: 180, total: 600 },
  gu: { script: 180, total: 620 },
  bn: { script: 180, total: 620 },
};
const PAGES = ["/", "/scan", "/schemes", "/events", "/documents", "/documents/pitch-deck", "/search?q=grant", "/hi", "/hi/scan", "/hi/documents", "/es", "/de/scan", "/ar", "/ar/scan", "/he", "/he/documents", "/mr", "/kn", "/ta", "/te"];

for (const path of PAGES) {
  test(`${path} stays within the page weight budget`, async ({ page }) => {
    const sizes = { script: 0, total: 0 };
    page.on("response", async (res) => {
      if (new URL(res.url()).origin !== new URL(page.url() || res.url()).origin) return;
      const { responseBodySize, responseHeadersSize } = await res.request().sizes().catch(() => ({ responseBodySize: 0, responseHeadersSize: 0 }));
      const len = responseBodySize + responseHeadersSize;
      if (process.env.WEIGHT_DEBUG) console.log(`  ${res.request().resourceType()} ${Math.round(len / 1024)} KB ${res.url().slice(-60)}`);
      sizes.total += len;
      if (res.request().resourceType() === "script") sizes.script += len;
    });
    await page.goto(path, { waitUntil: "networkidle" });
    const kb = { script: Math.round(sizes.script / 1024), total: Math.round(sizes.total / 1024) };
    console.log(`${path}: ${kb.script} KB script, ${kb.total} KB total`);
    const budget = BUDGET_KB[path.match(/^\/([a-z]{2})(\/|$)/)?.[1] ?? "en"] ?? BUDGET_KB.en;
    expect(kb.script, `${path} script`).toBeLessThanOrEqual(budget.script);
    expect(kb.total, `${path} total`).toBeLessThanOrEqual(budget.total);
  });
}
