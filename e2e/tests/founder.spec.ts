import { readFile } from "node:fs/promises";
import { expect, signIn, test, uniqueEmail } from "./fixtures";

test.describe("founder journey", () => {
  test("anonymous Scheme Scan from the home page", async ({ page }) => {
    await page.goto("/");
    await page.locator('select[name="state"]').selectOption("KA");
    await page.locator('select[name="entityType"]').selectOption("private_limited");
    await page.locator('select[name="stage"]').selectOption("prototype");
    await page.locator('form[action="/scan"] button').click();

    await expect(page).toHaveURL(/\/scan\?.*state=KA/);
    await expect(page.locator("#state")).toHaveValue("KA");
    await page.locator("#inc").fill("2025-06-01");
    await page.locator("#turnover").fill("0.4");
    await page.locator("#support").fill("0");
    await page.locator("#promoter").fill("100");
    await page.getByRole("button", { name: "MedTech / Medical devices", exact: true }).click();
    // Yes / No / Not sure are styled labels around hidden radio buttons.
    await page.locator('label:has(input[name="dpiit"])', { hasText: /^Yes$/ }).click();
    await page.locator('label:has(input[name="deep"])', { hasText: /^Yes$/ }).click();
    await page.locator('label:has(input[name="women"])', { hasText: /^No$/ }).click();
    await expect(page.locator('input[name="dpiit"]').first()).toBeChecked();
    await page.locator('button[type="submit"]').click();

    const results = page.locator("#results-h");
    await expect(results).toBeVisible();
    await expect(results).toContainText(/\d+ (scheme|schemes)/);
    // Each result links to its scheme page.
    await expect(page.locator("#results-h ~ ol a").first()).toHaveAttribute("href", /\/schemes\//);
  });

  test("sign in, build a profile, manage consents, export and delete", async ({ page }) => {
    const email = uniqueEmail("founder");
    await signIn(page, email);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.locator("#name").fill("Shravya Devices");
    await page.locator("#entity").selectOption("private_limited");
    await page.locator("#st").selectOption("UP");
    await page.locator("#stage").selectOption("prototype");
    await page.locator("#dpiit").selectOption("true");
    await page.getByRole("button", { name: "MedTech / Medical devices", exact: true }).click();
    await page.getByRole("button", { name: "Create profile" }).click();
    await expect(page.getByText("Profile created.")).toBeVisible();

    await page.getByRole("button", { name: "Check my schemes" }).click();
    await expect(page.locator("#results-h")).toBeVisible();

    // Switching on an optional consent is recorded and survives a reload.
    const row = page.locator("#privacy-h ~ ul li", { hasText: "Show my profile to investors" });
    await expect(row.locator("button")).toHaveText("Off");
    await row.locator("button").click();
    await expect(row.locator("button")).toHaveText("On");
    await page.reload();
    await expect(page.locator("#privacy-h ~ ul li", { hasText: "Show my profile to investors" }).locator("button")).toHaveText("On");

    // Export holds the profile and the consent history.
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download my data" }).click()]);
    expect(download.suggestedFilename()).toBe("foundura-my-data.json");
    const data = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(data.account.email).toBe(email);
    expect(JSON.stringify(data)).toContain("Shravya Devices");
    expect(JSON.stringify(data)).toContain("investor_visibility");

    // Delete asks first, then signs out and the account is gone.
    page.once("dialog", (d) => {
      expect(d.message()).toContain("cannot be undone");
      void d.accept();
    });
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });

  test("sign out goes home and ends the session", async ({ page }) => {
    await signIn(page, uniqueEmail("leaver"));
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/localhost:3100\/$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });

  test("investor dashboard asks for sign-in and comes back after", async ({ page }) => {
    await page.goto("/dashboard/investor");
    await expect(page).toHaveURL(/\/signin\?next=%2Fdashboard%2Finvestor$/);
    await signIn(page, uniqueEmail("returning"), { path: page.url() });
    await expect(page).toHaveURL(/\/dashboard\/investor$/);
  });

  test("public pages render", async ({ page }) => {
    for (const [path, heading] of [
      ["/events", /events/i],
      ["/schemes", /schemes/i],
      ["/policy", /policy/i],
      ["/learn", /learn|guides/i],
      ["/startups", /startups/i],
      ["/investors", /investor/i],
      ["/privacy", /privacy/i],
      ["/terms", /terms/i],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("h1"), path).toContainText(heading);
    }
  });

  test("sign-in form shows the terms and the age line", async ({ page }) => {
    await page.goto("/signin");
    await page.locator('input[type="email"]').fill(uniqueEmail("check"));
    await page.locator("form button").first().click();
    await expect(page.locator("fieldset")).toContainText("18 or older");
    await expect(page.locator("fieldset a", { hasText: /terms/i })).toHaveAttribute("href", "/terms");
    await expect(page.locator("footer a", { hasText: "Terms of use" })).toBeVisible();
  });

  test("unknown address shows the site's own not-found page", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Page not found");
    await expect(page.getByRole("link", { name: "Start Scheme Scan" })).toHaveAttribute("href", "/scan");
  });
});
