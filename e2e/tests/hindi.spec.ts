import { LANGS } from "../../apps/web/src/i18n/config";
import { expect, signIn, test, uniqueEmail } from "./fixtures";

test.describe("Hindi", () => {
  test("switching language keeps the page, and the scan works in Hindi", async ({ page }) => {
    await page.goto("/");
    await page.locator("header details summary").click();
    await page.locator("header").getByRole("link", { name: "हिन्दी" }).click();
    await expect(page).toHaveURL(/\/hi$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");

    await page.locator('select[name="state"]').selectOption("KA");
    await page.getByRole("button", { name: "योजना जाँच शुरू करें" }).click();
    await expect(page).toHaveURL(/\/hi\/scan\?.*state=KA/);
    await page.locator("#entityType").selectOption("private_limited");
    await page.getByRole("button", { name: "मेडटेक / चिकित्सा उपकरण", exact: true }).click();
    await page.getByRole("button", { name: "मेरी योजनाएँ जाँचें" }).click();
    await expect(page.locator("#results-h")).toBeVisible();
    // Scheme names and the conditions come back in Hindi.
    await expect(page.locator("#results-h ~ ol h3").first()).toContainText(/[ऀ-ॿ]/);
    await expect(page.locator("#results-h ~ ol li ul li").first()).toContainText(/[ऀ-ॿ]/);
    await expect(page.locator("#results-h ~ ol a").first()).toHaveAttribute("href", /^\/hi\/schemes\//);

    await page.goto("/hi/privacy");
    await page.locator("header details summary").click();
    await page.locator("header").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/localhost:3100\/privacy$/);
  });

  test("sign in from Hindi, build a profile and pick the email language", async ({ page }) => {
    await signIn(page, uniqueEmail("hindi"), { path: "/hi/signin" });
    await expect(page).toHaveURL(/\/hi\/dashboard$/);
    // Signing in from a Hindi page sets Hindi as the email language.
    await expect(page.locator("#email-lang")).toHaveValue("hi");

    await page.locator("#name").fill("श्रुति हियरिंग");
    await page.locator("#entity").selectOption("private_limited");
    await page.locator("#st").selectOption("KA");
    await page.locator("#stage").selectOption("prototype");
    await page.getByRole("button", { name: "प्रोफ़ाइल बनाएँ" }).click();
    await expect(page.getByText("प्रोफ़ाइल बन गई")).toBeVisible();
    await expect(page.locator("#inv-h")).toContainText(/[ऀ-ॿ]/);

    await page.locator("#email-lang").selectOption("en");
    await expect(page.getByText("सेव हो गया")).toBeVisible();
    await page.reload();
    await expect(page.locator("#email-lang")).toHaveValue("en");
    // The site stays in Hindi; only emails change.
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
  });

  test("addresses: /en redirects, the editor console stays English, unknown pages 404 in Hindi", async ({ page }) => {
    await page.goto("/en/events");
    await expect(page).toHaveURL(/localhost:3100\/events$/);
    await page.goto("/hi/admin");
    await expect(page).toHaveURL(/localhost:3100\/(admin|signin\?next=(%2F|\/)admin)$/);
    const res = await page.goto("/hi/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText(/[ऀ-ॿ]/);
  });

  // Latin-script words that are fine on a Hindi page. All-caps acronyms (DPIIT, MSME, CDSCO) and
  // email or web addresses are skipped separately.
  const ALLOW = new Set([
    // Names Hindi writers keep in English, and scheme names given in brackets.
    ..."Foundura SaaS GeM MeitY iSAFE English India Startup MedTech Mission Google Apple Outlook".split(" "),
    // The Data Protection Board's English name next to the Hindi one.
    ..."Data Protection Board of".split(" "),
    // Service providers named on the privacy page.
    ..."DigitalOcean Zoho ZeptoMail".split(" "),
    // Values partners type into the embed code, shown on the partners page.
    ..."idea prototype early_revenue growth private_limited".split(" "),
    // Language codes, listed for partners on the widget page.
    ...LANGS,
  ]);
  const isAcronym = (w: string) => /^[A-Z0-9&-]+$/.test(w) || /^[A-Z][A-Z0-9]*[a-z][A-Z0-9]+$/.test(w);
  const PAGES = [
    "/hi",
    "/hi/scan",
    "/hi/schemes",
    "/hi/schemes/dpiit-startup-recognition",
    "/hi/events",
    "/hi/events?view=list",
    "/hi/policy",
    "/hi/learn",
    "/hi/startups",
    "/hi/documents",
    "/hi/glossary",
    "/hi/search",
    "/hi/search?q=%E0%A4%85%E0%A4%A8%E0%A5%81%E0%A4%A6%E0%A4%BE%E0%A4%A8",
    "/hi/search?q=seed",
    "/hi/documents/founders-agreement",
    "/hi/documents/pitch-deck",
    "/hi/documents/cap-table",
    "/hi/documents/medtech-regulatory-plan",
    "/hi/documents/quotation-and-invoice",
    "/hi/investors",
    "/hi/partners",
    "/hi/signin",
    "/hi/privacy",
    "/hi/terms",
    "/hi/sectors/medtech",
    "/hi/unsubscribe?u=x&t=yyyyyyyyyyyyyyyyyyyyyyyy",
    "/hi/embed/scan",
    "/hi/no-such-page",
  ];

  test("no untranslated English on Hindi pages", async ({ page }) => {
    const report: Record<string, string[]> = {};
    for (const path of PAGES) {
      await page.goto(path);
      if (path === "/hi/scan") {
        await page.locator('button[type="submit"]').click();
        await expect(page.locator("#results-h")).toBeVisible();
      }
      // Text outside elements marked lang="en" (scheme names kept in English, quoted sources and so on).
      const words = await page.evaluate(() => {
        const out: string[] = [];
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = walk.nextNode())) {
          const el = n.parentElement;
          if (!el || el.closest('[lang="en"],[lang="en-IN"],[lang]:not([lang^="hi"]),script,style,code,pre,noscript,mark,[aria-hidden="true"]')) continue;
          const text = (n.textContent ?? "").replace(/\S+@\S+|https?:\/\/\S+|\b[\w-]+(\.[\w-]+)*\.(in|org|com|gov|net)\b\S*/g, " ");
          for (const w of text.match(/[A-Za-z][A-Za-z&_\-]+/g) ?? []) out.push(w);
        }
        return out;
      });
      const bad = [...new Set(words.filter((w) => !ALLOW.has(w) && !isAcronym(w)))];
      if (bad.length) report[path] = bad.slice(0, 20);
    }
    expect(report, "English words on Hindi pages (mark real English with lang=\"en\", or translate)").toEqual({});
  });
});
