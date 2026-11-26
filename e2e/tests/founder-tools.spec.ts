import AxeBuilder from "@axe-core/playwright";
import { expect, newVisitor, signIn, test, uniqueEmail } from "./fixtures";
import { PERKS } from "../../apps/web/src/perks/directory";

test.describe("founder tools", () => {
  test("the site can be installed, in the visitor's language", async ({ page, request }) => {
    await page.goto("/hi");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/api/manifest/hi");
    const res = await request.get("/api/manifest/hi");
    expect(res.headers()["content-type"]).toContain("application/manifest+json");
    const m = await res.json();
    expect(m).toMatchObject({ name: "Foundura", lang: "hi-IN", start_url: "/hi", display: "standalone" });
    expect(m.icons.map((i: { purpose: string }) => i.purpose)).toEqual(["any", "any", "maskable"]);
    for (const i of m.icons) expect((await request.get(i.src)).ok()).toBe(true);
    expect(m.shortcuts[0]).toEqual(expect.objectContaining({ name: "योजना जाँच", url: "/hi/scan" }));
    expect((await (await request.get("/api/manifest/en")).json()).start_url).toBe("/");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f7f8fc");
  });

  test("perks list official links only, with a way to report changes", async ({ page }) => {
    await page.goto("/perks");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Startup perks");
    await expect(page.getByText(/not yet checked by our editors/)).toBeVisible();
    for (const h of ["With DPIIT recognition", "Cloud and AI credits", "Software for your team"]) {
      await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
    }
    const main = page.getByRole("main");
    await expect(main.locator("li[id^=perk-]")).toHaveCount(PERKS.length);
    // Official sites open in a new tab and carry nothing about the visitor.
    const official = main.getByRole("link", { name: /^Official page/ });
    await expect(official).toHaveCount(PERKS.filter((p) => p.url).length);
    for (const a of await official.all()) {
      await expect(a).toHaveAttribute("rel", "noopener noreferrer");
      expect(await a.getAttribute("href")).toMatch(/^https:\/\//);
    }
    await expect(main.locator("#perk-aws-activate a[href^=mailto]")).toHaveAttribute("href", /subject=Perks%3A%20AWS%20Activate/);
    await main.locator("#perk-tax-holiday").getByRole("link", { name: "Scheme details" }).click();
    await expect(page).toHaveURL(/\/schemes\/income-tax-holiday-80iac$/);
  });

  test("perks show up in site search", async ({ page }) => {
    await page.goto("/search?q=AWS%20Activate");
    await expect(page.getByRole("main").getByRole("link", { name: "AWS Activate" })).toHaveAttribute("href", "/perks#perk-aws-activate");
  });

  test("the investor update builder writes the email in the browser and sends nothing", async ({ page }) => {
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET" && !r.url().endsWith("/api/m")) posts.push(r.url());
    });
    await page.goto("/investor-update");
    await page.getByLabel("Startup name").fill("Shruti Hearing");
    await page.getByLabel("Month", { exact: true }).fill("2026-10");
    await page.getByLabel("Highlights").fill("Signed 3 hospitals\n- Hired a sales lead");
    await page.getByLabel("Revenue this month (₹)").fill("200000");
    await page.getByLabel("Money spent this month (₹)").fill("700000");
    await page.getByLabel("Cash in the bank (₹)").fill("5000000");
    await page.getByLabel("How investors can help").fill("Intros to state health missions");

    await expect(page.getByLabel("Subject")).toHaveValue("Shruti Hearing update: October 2026");
    const body = page.getByLabel("Email text");
    await expect(body).toHaveValue(/Here is our update for October 2026\./);
    await expect(body).toHaveValue(/- Signed 3 hospitals\n- Hired a sales lead/);
    await expect(body).toHaveValue(/Revenue: ₹2,00,000/);
    await expect(body).toHaveValue(/Net burn: ₹5,00,000/);
    await expect(body).toHaveValue(/Runway: about 10 months/);
    await expect(body).toHaveValue(/How you can help\n- Intros to state health missions/);
    await expect(body).not.toHaveValue(/Challenges/);

    // Income covering spending is said in words, not as a negative runway.
    await page.getByLabel("Revenue this month (₹)").fill("900000");
    await expect(body).toHaveValue(/Runway: revenue covers spending/);
    expect(posts).toEqual([]);

    // Other languages write the email in that language.
    await page.goto("/hi/investor-update");
    await page.getByLabel("स्टार्टअप का नाम").fill("श्रुति");
    await expect(page.getByLabel("विषय")).toHaveValue(/^श्रुति अपडेट: /);
  });

  test("progress tracker and private profile link", async ({ page, browser }) => {
    await signIn(page, uniqueEmail("tracker"));
    await page.locator("#name").fill("Krishi Sense");
    await page.locator("#entity").selectOption("private_limited");
    await page.locator("#stage").selectOption("prototype");
    await page.locator("#to").fill("3.5");
    await page.getByRole("button", { name: "Create profile" }).click();
    await expect(page.getByText("Profile created.")).toBeVisible();

    // Pick a stage, tick its steps; it's saved and the next stage is offered.
    const tracker = page.locator("section", { has: page.locator("#progress-h") });
    await expect(tracker.getByText("Choose your stage to see its steps.")).toBeVisible();
    await tracker.getByText("Setting up", { exact: true }).click();
    await expect(tracker.getByRole("radio", { name: /Setting up/ })).toBeChecked();
    await expect(tracker.getByRole("link", { name: "Template: Founders' agreement" })).toHaveAttribute("href", "/documents/founders-agreement");
    for (const step of ["Register a private limited company or LLP", "Sign a founders' agreement with vesting", "Apply for DPIIT recognition"]) {
      await tracker.getByLabel(step).check();
      await expect(tracker.getByRole("status")).toHaveText("Saved.");
    }
    await expect(tracker.getByText("3 of 24 steps done")).toBeVisible();
    await tracker.getByRole("button", { name: "Move on to Building the MVP" }).click();
    await expect(tracker.getByRole("radio", { name: /Building the MVP/ })).toBeChecked();
    await tracker.getByLabel("Build the smallest version that solves the problem").check();
    await expect(tracker.getByRole("status")).toHaveText("Saved.");
    await page.reload();
    await expect(tracker.getByRole("radio", { name: /Building the MVP/ })).toBeChecked();
    await expect(tracker.getByLabel("Build the smallest version that solves the problem")).toBeChecked();

    const { violations } = await new AxeBuilder({ page }).include("section:has(#progress-h)").include("section:has(#share-h)").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);

    // A private link shows the chosen parts, never the figures, and stops when switched off.
    const share = page.locator("section", { has: page.locator("#share-h") });
    await expect(share.getByText("You have no active link.")).toBeVisible();
    await share.getByRole("button", { name: "Make a link" }).click();
    const url = await share.getByLabel("Your private link").inputValue();
    expect(url).toMatch(/\/shared\/[A-Za-z0-9_-]{43}$/);
    await expect(share.getByText(/Your link works until/)).toBeVisible();

    const guest = await newVisitor(browser);
    const res = await guest.goto(url);
    expect(res!.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res!.headers()["x-robots-tag"]).toContain("noindex");
    await expect(guest.getByRole("heading", { level: 1 })).toHaveText("Krishi Sense");
    await expect(guest.getByText("Krishi Sense shared this page with you privately", { exact: false })).toBeVisible();
    await expect(guest.getByText("Stage 4 of 8: Building the MVP")).toBeVisible();
    await expect(guest.getByRole("heading", { name: "Readiness score" })).toBeVisible();
    await expect(guest.getByText("4 of 24 steps done")).toBeVisible();
    await expect(guest.locator("body")).not.toContainText("3.5");
    await expect(guest.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    await share.getByRole("button", { name: "Switch off the link" }).click();
    await expect(share.getByRole("status")).toHaveText("The link no longer works.");
    await guest.reload();
    await expect(guest.getByRole("heading", { level: 1 })).toHaveText("This link isn't working");
    await guest.context().close();
  });
});
