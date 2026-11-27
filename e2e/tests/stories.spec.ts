import AxeBuilder from "@axe-core/playwright";
import { DICTS } from "../../apps/web/src/i18n/dicts";
import { expect, newVisitor, signIn, test, uniqueEmail } from "./fixtures";

const en = DICTS.en.stories;
const para = "We spent our first year in mandis around Nashik, asking traders why produce was thrown away each evening. ";

test.describe("founder stories", () => {
  test("a founder writes a story, confirms everything, and it is public only after an editor publishes it", async ({ page, browser, admin }) => {
    await signIn(page, uniqueEmail("story"));
    await page.locator("#name").fill(`Taaza ${Date.now()}`);
    await page.locator("#entity").selectOption("private_limited");
    await page.locator("#stage").selectOption("prototype");
    await page.getByRole("button", { name: "Create profile" }).click();
    await expect(page.getByText("Profile created.")).toBeVisible();

    const box = page.locator("section", { has: page.locator("#story-h") });
    await expect(box.getByLabel(en.fTitle)).toBeEnabled();
    await box.getByLabel(en.fTitle).fill("What the evening market taught us");
    await box.getByLabel(en.fBody).fill(`${para.repeat(3)}\n\n${para.repeat(2)}`);
    await box.getByLabel(en.fName).fill("Meera Joshi");
    await box.getByLabel(en.fRole).fill("Founder");
    await box.getByRole("button", { name: en.save }).click();
    await expect(box.getByRole("status")).toHaveText(en.saved);
    await expect(box.getByText(`Status: ${en.status.draft}`)).toBeVisible();

    // Every confirmation must be ticked.
    await box.getByLabel(en.confirm.self).check();
    await box.getByRole("button", { name: en.submit }).click();
    await expect(box.getByRole("status")).toHaveText(en.tickAll);
    for (const c of ["company", "cofounders", "others", "figures", "own"] as const) await box.getByLabel(en.confirm[c]).check();
    await box.getByRole("button", { name: en.submit }).click();
    await expect(box.getByRole("status")).toHaveText(en.submitted);
    await expect(box.getByText(`Status: ${en.status.submitted}`)).toBeVisible();
    await expect(box.getByLabel(en.fTitle)).toBeDisabled();

    const { violations } = await new AxeBuilder({ page }).include("section:has(#story-h)").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);

    // Not public yet; an editor publishes it.
    const guest = await newVisitor(browser);
    const queue = await (await admin.get("admin/stories")).json();
    const row = queue.find((s: { title: string }) => s.title === "What the evening market taught us");
    expect((await guest.goto(`/stories/${row.slug}`))?.status()).toBe(404);
    expect(row.consent).toMatchObject({ action: "given", matchesText: true });
    expect((await admin.post(`admin/stories/${row.id}/publish`)).status()).toBe(200);

    await guest.goto("/stories");
    await guest.getByRole("link", { name: "What the evening market taught us" }).click();
    await expect(guest.locator("h1")).toHaveText("What the evening market taught us");
    await expect(guest.getByText("Meera Joshi, Founder", { exact: false })).toBeVisible();
    await expect(guest.getByRole("link", { name: en.removalLink })).toHaveAttribute("href", /^mailto:.*subject=Founder%20story/);
    const url = guest.url();
    await guest.goto(url.replace("/stories/", "/hi/stories/"));
    await expect(guest.locator('h1[lang="en"], [lang="en"] h1')).toHaveText("What the evening market taught us");

    // Withdrawing takes it off the site at once.
    await page.reload();
    await expect(box.getByRole("link", { name: en.view })).toBeVisible();
    await box.getByRole("button", { name: en.withdraw }).click();
    await expect(box.getByRole("status")).toHaveText(en.withdrawn);
    expect((await guest.goto(url))?.status()).toBe(404);
    await guest.goto("/stories");
    await expect(guest.getByRole("link", { name: "What the evening market taught us" })).toHaveCount(0);
    await guest.context().close();

    // The export carries the consent history.
    const exp = await (await page.request.get("/api/me/export")).json();
    expect(exp.founderStories[0].consentHistory.map((c: { action: string }) => c.action)).toEqual(["given", "withdrawn"]);
  });
});
