import { expect, test } from "./fixtures";

test.describe("about, contact and the weekly email", () => {
  test("the about page says what Foundura does and what it promises", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About Foundura" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "We never handle money" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What Foundura is not" })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Contact us" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("the contact page gives an email for each topic and warns about scams", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1, name: "Contact Foundura" })).toBeVisible();
    const mails = page.getByRole("main").locator("a[href^='mailto:']");
    expect(await mails.count()).toBeGreaterThanOrEqual(3);
    await expect(page.getByRole("heading", { name: "Beware of anyone using our name" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "My startup" })).toHaveAttribute("href", "/dashboard");
  });

  test("both pages are linked from the footer in every language", async ({ page }) => {
    await page.goto("/hi");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Foundura के बारे में" })).toHaveAttribute("href", "/hi/about");
    await expect(footer.getByRole("link", { name: "संपर्क" })).toHaveAttribute("href", "/hi/contact");
  });

  test("anyone can sign up for the weekly email from the footer; it asks them to confirm", async ({ page }) => {
    await page.goto("/funding");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("textbox", { name: "Email address" }).fill(`reader-${Date.now()}@example.com`);
    await footer.getByRole("button", { name: "Sign up" }).click();
    await expect(footer.getByRole("status")).toHaveText("Almost done: check your inbox and click the link to confirm.");
  });

  test("other languages say the email comes in English or Hindi", async ({ page }) => {
    await page.goto("/ta");
    await expect(page.getByRole("contentinfo")).toContainText("மின்னஞ்சல் ஆங்கிலத்தில் அல்லது இந்தியில் வரும்.");
  });

  test("a bad confirm or stop link says so instead of failing silently", async ({ page }) => {
    await page.goto(`/newsletter/confirm?s=nope&t=${"x".repeat(43)}`);
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "This link has expired" })).toBeVisible();
    await page.goto(`/unsubscribe?s=nope&t=${"x".repeat(43)}`);
    await expect(page.getByRole("heading", { level: 1, name: "Stop the weekly email?" })).toBeVisible();
    await page.getByRole("button", { name: "Stop the weekly email" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "This link didn't work." })).toBeVisible();
    await page.goto("/newsletter/confirm");
    await expect(page.getByText("This link is incomplete.")).toBeVisible();
  });
});
