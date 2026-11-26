import { expect, newVisitor, signIn, test, uniqueEmail } from "./fixtures";
import { SUPPORT } from "../../apps/web/src/support/directory";

test.describe("open data, numbers, cities and list widgets", () => {
  test("open data lists every dataset and the files hold nothing personal", async ({ page, request }) => {
    await page.goto("/data");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Open data");
    for (const id of ["schemes", "funding", "support", "perks", "events", "startups"]) {
      await expect(page.locator(`#data-${id} a[href="/data/${id}.csv"]`)).toBeVisible();
    }
    await expect(page.getByRole("main").getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("rel", /license/);

    const csv = await request.get("/data/support.csv");
    expect(csv.headers()["content-type"]).toContain("text/csv");
    expect(csv.headers()["access-control-allow-origin"]).toBe("*");
    const text = await csv.text();
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text.split("\r\n")[0]).toBe("﻿name,kind,area,based,offer,url");
    expect(text).toContain("Shell E4,corporate,IN");

    const json = await (await request.get("/data/schemes.json")).json();
    expect(json).toMatchObject({ dataset: "schemes", licence: { name: "CC BY 4.0" } });
    expect(json.rows.length).toBeGreaterThan(5);

    // A public startup appears with factual fields only.
    await signIn(page, uniqueEmail("opendata"));
    await page.locator("#name").fill("Open Kiln");
    await page.locator("#st").selectOption("KA");
    await page.locator("#city").selectOption("bengaluru");
    await page.locator("#to").fill("4.2");
    await page.locator("#oneLiner").fill("Kilns that sip power");
    await page.getByLabel(/Show a public profile/).check();
    await page.getByRole("button", { name: "Create profile" }).click();
    await expect(page.getByText("Profile created.")).toBeVisible();
    const startups = await (await request.get("/data/startups.json")).json();
    const row = startups.rows.find((r: { name: string }) => r.name === "Open Kiln");
    expect(row).toMatchObject({ state: "KA", city: "bengaluru" });
    expect(Object.keys(row)).not.toContain("one_liner");
    expect(JSON.stringify(startups)).not.toContain("4.2");
    expect(JSON.stringify(startups)).not.toContain("@");

    const guest = await newVisitor(page.context().browser()!);
    await guest.goto("/cities/bengaluru");
    await expect(guest.getByRole("heading", { level: 1 })).toHaveText("Startups in Bengaluru");
    await expect(guest.locator("section", { has: guest.locator("#startups-h") })).toContainText("Open Kiln");
    await guest.context().close();
    await request.get("/data/nope.csv").then((r) => expect(r.status()).toBe(404));
  });

  test("city pages gather support, funders and events", async ({ page }) => {
    await page.goto("/cities");
    const cards = page.getByRole("main").getByRole("link", { name: /Bengaluru|Delhi NCR|Mumbai|Hyderabad|Pune|Chennai|Ahmedabad|Kolkata/ });
    await expect(cards).toHaveCount(8);
    await page.goto("/cities/bengaluru");
    const support = page.locator("section", { has: page.locator("#support-h") });
    for (const e of SUPPORT.filter((s) => /Bengaluru|Bangalore/.test(s.base))) await expect(support).toContainText(e.name);
    await expect(page.getByRole("link", { name: "Schemes and support across Karnataka" })).toHaveAttribute("href", "/states/ka");
    await page.goto("/hi/cities/pune");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("पुणे के स्टार्टअप");
    expect((await page.goto("/cities/atlantis"))!.status()).toBe(404);
  });

  test("Foundura in numbers shows totals and no one in particular", async ({ page }) => {
    await page.goto("/numbers");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Foundura in numbers");
    await expect(page.getByRole("main").locator("dl").first()).toContainText("Support organisations");
    await expect(page.getByRole("heading", { name: "Schemes by kind" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The last 30 days" })).toBeVisible();
  });

  test("corporate programmes have their own section on the states page", async ({ page }) => {
    await page.goto("/states");
    const corp = page.locator("section", { has: page.locator("#corporate-h") });
    await expect(corp).toContainText("Google for Startups Accelerator: India");
    await expect(page.locator("section", { has: page.locator("#national-h") })).not.toContainText("Shell E4");
  });

  test("list widgets can be embedded and link back to Foundura", async ({ page, request }) => {
    const res = await page.goto("/embed/support?state=KA");
    expect(res!.headers()["content-security-policy"]).toContain("frame-ancestors *");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Incubators and support in Karnataka");
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See more on Foundura" })).toHaveAttribute("href", "/states/ka");
    await page.goto("/hi/embed/schemes");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("पूरे भारत में खुली स्टार्टअप योजनाएँ");
    expect((await request.get("/embed/nothing")).status()).toBe(404);
    const js = await (await request.get("/embed.js")).text();
    expect(js).toContain("data-widget");
    await page.goto("/partners");
    await expect(page.getByRole("main").locator("pre").nth(1)).toContainText('data-widget="events"');
  });
});
