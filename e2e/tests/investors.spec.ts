import { ADMIN_EMAIL } from "../playwright.config";
import { expect, newVisitor, signIn, test, uniqueEmail } from "./fixtures";

test("Investor Connect: profile, editor review, intro request, accept", async ({ browser }) => {
  const stamp = Date.now();
  const firm = `Kaveri Health Angels ${stamp}`;
  const startup = `Shruti Hearing ${stamp}`;
  const investorEmail = uniqueEmail("asha");
  const founderEmail = uniqueEmail("shruti");

  // Investor creates a profile; it waits for review.
  const inv = await newVisitor(browser);
  await signIn(inv, investorEmail, { path: "/signin?next=/dashboard/investor" });
  await expect(inv).toHaveURL(/\/dashboard\/investor$/);
  await inv.locator("#iname").fill("Asha Rao");
  await inv.locator("#ifirm").fill(firm);
  await inv.locator("#itype").selectOption("angel_network");
  await inv.locator("#ibio").fill("Early-stage health and medtech angels backing founders across South India.");
  for (const chip of ["MedTech / Medical devices", "HealthTech", "Prototype / MVP", "Early revenue"]) {
    await inv.getByRole("button", { name: chip, exact: true }).click();
  }
  await inv.locator("#cmin").fill("25");
  await inv.locator("#cmax").fill("100");
  await inv.getByRole("button", { name: "Create investor profile" }).click();
  await expect(inv.getByText("Investor profile created.")).toBeVisible();

  // Listed in the directory straight away, without the "Verified" badge.
  const pub = await newVisitor(browser);
  await pub.goto("/investors");
  const entry = pub.locator("main li", { hasText: firm });
  await expect(entry).toBeVisible();
  await expect(entry).not.toContainText("Verified");

  // Editor verifies.
  const ed = await newVisitor(browser);
  await signIn(ed, ADMIN_EMAIL, { path: "/signin?next=/admin/investors" });
  await expect(ed).toHaveURL(/\/admin\/investors$/);
  const card = ed.locator("li", { hasText: firm });
  await expect(card).toContainText("Waiting for review");
  await card.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(card).toContainText("Verified");

  await pub.reload();
  await expect(pub.locator("main li", { hasText: firm })).toContainText("Verified");

  // Founder builds a profile ready for investors.
  const f = await newVisitor(browser);
  await signIn(f, founderEmail);
  await f.locator("#name").fill(startup);
  await f.locator("#website").fill("https://shruti.example.com");
  await f.locator("#oneLiner").fill("Low-cost hearing screening for rural clinics");
  await f.locator("#entity").selectOption("private_limited");
  await f.locator("#inc").fill("2025-03-01");
  await f.locator("#st").selectOption("KA");
  await f.locator("#stage").selectOption("prototype");
  await f.locator("#dpiit").selectOption("true");
  await f.getByRole("button", { name: "MedTech / Medical devices", exact: true }).click();
  await f.locator("#deck").fill("https://shruti.example.com/deck.pdf");
  await f.locator("#raise").fill("150");
  await f.getByRole("button", { name: "Create profile" }).click();
  await expect(f.locator("#inv-h")).toBeVisible();

  const meter = f.locator('[role="meter"]');
  const before = Number(await meter.getAttribute("aria-valuenow"));
  await f.locator("label", { hasText: "Show a public profile" }).locator('input[type="checkbox"]').check();
  await f.getByRole("button", { name: "Save profile" }).click();
  await expect(f.getByText("Profile saved.")).toBeVisible();
  await f.locator("#privacy-h ~ ul li", { hasText: "Show my profile to investors" }).locator("button").click();
  await expect.poll(async () => Number(await meter.getAttribute("aria-valuenow"))).toBeGreaterThan(before);

  // The verified investor shows up as a match; the founder asks for an intro.
  const match = f.locator("li", { hasText: firm });
  await match.getByRole("button", { name: "Request intro" }).click();
  await match.locator("textarea").fill("We build a hand-held hearing screener for community health workers, piloting in 12 clinics in Mysuru.");
  await match.getByRole("button", { name: "Send intro request" }).click();
  await expect(f.getByText("Intro: waiting for a reply")).toBeVisible();
  // The founder's email is not shared before the investor accepts.
  await inv.reload();
  await expect(inv.locator("main")).toContainText("Startups that fit your focus");
  await expect(inv.locator("main")).toContainText(startup);
  await expect(inv.locator("main")).not.toContainText(founderEmail);

  await inv.getByRole("button", { name: "Accept and share contacts" }).click();
  await expect(inv.locator("main")).toContainText(founderEmail);

  await f.reload();
  await expect(f.locator("main")).toContainText(investorEmail);
});
