import { expect, test } from "./fixtures";

// Slugs must match apps/web/src/documents; the count guards against a document being dropped by mistake.
const WORD = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const POWERPOINT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

test.describe("founder documents", () => {
  test("the hub lists every template and the finder changes with goal and stage", async ({ page }) => {
    await page.goto("/documents");
    await expect(page.locator("h1")).toHaveText("Founder documents");
    expect(await page.locator('main section[aria-labelledby^="cat-"] li').count()).toBeGreaterThanOrEqual(47);

    const first = page.locator('ol[aria-labelledby="first-h"] li');
    await expect(first.first()).toContainText("Pitch deck");
    await page.locator("label", { hasText: "Testing an idea" }).click();
    await expect(first.first()).toContainText("Lean canvas");
    await page.locator("label", { hasText: "Registering the company" }).click();
    await expect(first.first()).toContainText("Founders' agreement");
    await page.locator("label", { hasText: "Hiring people" }).click();
    await expect(first.first()).toContainText("Offer letter");
    const next = page.locator('ol[aria-labelledby="next-h"]');
    await expect(next).not.toContainText("ESOP grant letter");
    await expect(next).toContainText("Internship offer letter");
    await page.locator("label", { hasText: "Growth" }).click();
    await expect(next).toContainText("ESOP grant letter");

    await first.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/documents\/offer-letter$/);
  });

  test("a legal template has a guide, a lawyer note, a preview and a Word download", async ({ page }) => {
    await page.goto("/documents/founders-agreement");
    await expect(page.locator("h1")).toHaveText("Founders' agreement");
    await expect(page.getByRole("note")).toContainText("Have a lawyer review this before anyone signs");
    await expect(page.locator("#india-h + ul")).toContainText("section 27 of the Indian Contract Act");
    await expect(page.locator("#preview-h + div")).toContainText("4. Vesting");

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download the Word template" }).click()]);
    expect(download.suggestedFilename()).toBe("foundura-founders-agreement.docx");
  });

  test("a non-legal template has no lawyer note", async ({ page }) => {
    await page.goto("/documents/pitch-deck");
    await expect(page.getByRole("note")).toHaveCount(0);
    await expect(page.locator("#preview-h + ol > li")).toHaveCount(12);
  });

  test("every file downloads as a real Word, Excel or PowerPoint file", async ({ page, request }) => {
    await page.goto("/documents");
    // Each entry on the hub: its slug and the format shown beside it.
    const items = await page.locator('main section[aria-labelledby^="cat-"] li').evaluateAll((lis) =>
      lis.map((li) => ({ slug: li.querySelector("a")!.getAttribute("href")!.split("/").pop()!, format: li.querySelector('span[lang="en"]')!.textContent! })),
    );
    expect(items.length).toBeGreaterThanOrEqual(47);
    for (const { slug, format } of items) {
      const ext = format === "PowerPoint" ? "pptx" : format === "Excel" ? "xlsx" : "docx";
      const res = await request.get(`/downloads/foundura-${slug}.${ext}`);
      expect(res.status(), slug).toBe(200);
      expect(res.headers()["content-type"], slug).toBe(ext === "pptx" ? POWERPOINT : ext === "xlsx" ? EXCEL : WORD);
      expect(res.headers()["content-disposition"], slug).toContain("attachment");
      const body = await res.body();
      // Office files are zip archives: they start with "PK".
      expect(body.subarray(0, 2).toString(), slug).toBe("PK");
      expect(body.length, slug).toBeGreaterThan(5000);
    }
    expect((await request.get("/downloads/foundura-nope.docx")).status()).toBe(404);
  });

  test("Hindi pages show Hindi titles and say the template is in English", async ({ page }) => {
    await page.goto("/hi/documents");
    await expect(page.locator("main")).toContainText("संस्थापकों का समझौता");
    await page.getByRole("link", { name: "संस्थापकों का समझौता" }).first().click();
    await expect(page).toHaveURL(/\/hi\/documents\/founders-agreement$/);
    await expect(page.locator("main")).toContainText("यह गाइड और टेम्पलेट अभी अंग्रेज़ी में हैं।");
    await expect(page.locator("#preview-h + div")).toHaveAttribute("lang", "en");
  });

  test("example and Hindi versions download", async ({ page, request }) => {
    await page.goto("/documents/pitch-deck");
    await expect(page.getByRole("link", { name: "Download a filled-in example" })).toHaveAttribute("href", "/downloads/foundura-pitch-deck-example.pptx");
    await expect(page.getByRole("link", { name: "Download the template in Hindi" })).toHaveAttribute("href", "/downloads/foundura-pitch-deck-hi.pptx");
    for (const file of ["foundura-pitch-deck-example.pptx", "foundura-pitch-deck-hi.pptx", "foundura-one-pager-example.docx", "foundura-one-pager-hi.docx", "foundura-business-plan-dpr-hi.docx"]) {
      const res = await request.get(`/downloads/${file}`);
      expect(res.status(), file).toBe(200);
      expect((await res.body()).subarray(0, 2).toString(), file).toBe("PK");
    }
  });

  test("glossary in English and Hindi", async ({ page }) => {
    await page.goto("/glossary");
    await expect(page.locator("h1")).toHaveText("Glossary");
    const entry = page.locator("dl > div", { hasText: "Liquidation preference" });
    await expect(entry).toContainText("before other shareholders");
    await page.goto("/hi/glossary");
    await expect(page.locator("dl > div", { hasText: "Cap table" })).toContainText("कैप टेबल");
    await expect(page.locator("dl > div", { hasText: "Cap table" }).locator("dt span").first()).toHaveAttribute("lang", "en");
  });

  test("documents are in the sitemap", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/documents</loc>");
    expect(sitemap).toContain("/documents/financial-model</loc>");
  });
});
