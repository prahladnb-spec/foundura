import { LANG_INFO, LANGS } from "../../apps/web/src/i18n/config";
import { en } from "../../apps/web/src/i18n/en";
import { es } from "../../apps/web/src/i18n/es";
import { de } from "../../apps/web/src/i18n/de";
import { ar } from "../../apps/web/src/i18n/ar";
import { he } from "../../apps/web/src/i18n/he";
import { expect, test } from "./fixtures";

const DICTS = { es, de, ar, he };

test.describe("languages", () => {
  test("the language menu offers every language and keeps the page", async ({ page }) => {
    await page.goto("/scan?state=KA");
    const header = page.locator("header");
    await header.locator("details summary").click();
    for (const l of LANGS) await expect(header.getByRole("link", { name: LANG_INFO[l].name, exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "English", exact: true })).toHaveAttribute("aria-current", "true");

    await header.getByRole("link", { name: "Español", exact: true }).click();
    await expect(page).toHaveURL(/\/es\/scan\?state=KA$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("h1")).toHaveText(es.scan.title);
    await expect(page.locator("#state")).toHaveValue("KA");

    await header.locator("details summary").click();
    await header.getByRole("link", { name: "עברית", exact: true }).click();
    await expect(page).toHaveURL(/\/he\/scan\?state=KA$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  for (const [code, t] of Object.entries(DICTS)) {
    test(`${code}: pages, links and the review note`, async ({ page }) => {
      await page.goto(`/${code}`);
      await expect(page.locator("html")).toHaveAttribute("lang", LANG_INFO[code as keyof typeof DICTS].tag);
      await expect(page.locator("html")).toHaveAttribute("dir", LANG_INFO[code as keyof typeof DICTS].dir);
      await expect(page.locator("h1")).toHaveText(t.home.h1);
      // Until a native speaker has checked it, the translation says so and asks for corrections.
      const note = page.locator("header").getByText(t.chrome.unreviewed.split("{email}")[0].trim());
      await expect(note).toBeVisible();
      await expect(page.locator("header a[href^='mailto:']")).toBeVisible();
      // Internal links stay in the language.
      await expect(page.locator("header nav[aria-label='Main'] a").first()).toHaveAttribute("href", `/${code}/scan`);

      // Templates and glossary terms have their own titles and meanings.
      await page.goto(`/${code}/documents/cap-table`);
      await expect(page.locator("h1")).not.toHaveText("Cap table");
      await page.goto(`/${code}/glossary`);
      await expect(page.locator("#dilution dd")).not.toHaveAttribute("lang", "en");

      // Legal text stays in English, the version that applies, with a translated note.
      await page.goto(`/${code}/privacy`);
      await expect(page.getByText(t.legalPages.englishOnly)).toBeVisible();
      await expect(page.locator('div[lang="en"] h1')).toBeVisible();
    });
  }

  test("the scan works in Arabic and the map keeps west on the left", async ({ page }) => {
    await page.goto("/ar/scan");
    await page.locator("#state").selectOption("KA");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#results-h")).toBeVisible();
    await expect(page.locator("#results-h ~ ol a").first()).toHaveAttribute("href", /^\/ar\/schemes\//);
    await page.goto("/ar/schemes");
    await expect(page.locator("nav.tile-map")).toHaveAttribute("dir", "ltr");
  });

  test("the editor console stays English", async ({ page }) => {
    const res = await page.request.get("/de/admin", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toMatch(/\/admin$/);
  });

  test("the partner widget opens in any language", async ({ page }) => {
    await page.setContent(`<script src="http://localhost:3100/embed.js" data-lang="de" async></script>`);
    await expect(page.locator("iframe")).toHaveAttribute("src", "http://localhost:3100/de/embed/scan");
    await page.setContent(`<script src="http://localhost:3100/embed.js" data-lang="xx" async></script>`);
    await expect(page.locator("iframe")).toHaveAttribute("src", "http://localhost:3100/embed/scan");
  });

  test("Spanish and German don't leave English strings behind", () => {
    // Text that is the same in English: place and programme names, and words both languages use.
    const SAME = new Set(
      "Startups|Startup|Startup India|Foundura|India|Google Calendar|Idea|Seed Fund Scheme|Sector|Deep tech|Seed fund|Pitch deck|ESOP|Term sheet|FinTech|Family office|₹{n} lakh|₹{n} crore|0.5 = ₹50 lakh|{noun} India|{n} startup|{n} startups|Events|Format|Online|Hybrid|Website|Investor|Event|Limited Liability Partnership (LLP)|Compliance".split("|"),
    );
    const leaves = (o: unknown, p = ""): [string, string][] =>
      typeof o === "string" ? [[p, o]] : Array.isArray(o) ? o.flatMap((v, i) => leaves(v, `${p}.${i}`)) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => leaves(v, p ? `${p}.${k}` : k)) : [];
    const E = new Map(leaves(en));
    for (const d of [es, de]) {
      const left = leaves(d).filter(([k, v]) => v.length > 3 && E.get(k) === v && !/^(labels\.state|labels\.match|home\.example)\./.test(k) && !SAME.has(v));
      expect(left, `${d.langName}: untranslated`).toEqual([]);
    }
  });

  test("no untranslated English on Arabic and Hebrew pages", async ({ page }) => {
    const ALLOW = new Set([
      ..."Foundura SaaS GeM MeitY iSAFE English India Startup MedTech Mission Google Apple Outlook".split(" "),
      // Values partners type into the embed code, shown on the partners page.
      ..."idea prototype early_revenue growth private_limited hi es de ar he".split(" "),
    ]);
    const isAcronym = (w: string) => /^[A-Z0-9&-]+$/.test(w) || /^[A-Z][A-Z0-9]*[a-z][A-Z0-9]+$/.test(w);
    const PAGES = ["/", "/scan", "/schemes", "/documents", "/documents/pitch-deck", "/glossary", "/search", "/search?q=pitch", "/events?view=list", "/investors", "/startups", "/partners", "/signin", "/learn", "/no-such-page"];
    const report: Record<string, string[]> = {};
    for (const code of ["ar", "he"]) {
      for (const p of PAGES) {
        const path = p === "/" ? `/${code}` : `/${code}${p}`;
        await page.goto(path);
        if (p === "/scan") {
          await page.locator('button[type="submit"]').click();
          await expect(page.locator("#results-h")).toBeVisible();
        }
        const words = await page.evaluate(() => {
          const out: string[] = [];
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let n: Node | null;
          while ((n = walk.nextNode())) {
            const el = n.parentElement;
            if (!el || el.closest('[lang="en"],[lang="en-IN"],[lang]:not([lang="ar"]):not([lang="he"]),script,style,code,pre,noscript,mark,[aria-hidden="true"]')) continue;
            const text = (n.textContent ?? "").replace(/\S+@\S+|https?:\/\/\S+|\b[\w-]+(\.[\w-]+)*\.(in|org|com|gov|net)\b\S*/g, " ");
            for (const w of text.match(/[A-Za-z][A-Za-z&_\-]+/g) ?? []) out.push(w);
          }
          return out;
        });
        const bad = [...new Set(words.filter((w) => !ALLOW.has(w) && !isAcronym(w)))];
        if (bad.length) report[path] = bad.slice(0, 20);
      }
    }
    expect(report, 'English words on Arabic or Hebrew pages (mark real English with lang="en", or translate)').toEqual({});
  });
});
