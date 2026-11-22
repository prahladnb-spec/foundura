import { ADMIN_EMAIL } from "../playwright.config";
import { expect, newVisitor, signIn, test, uniqueEmail, unsubscribeLink } from "./fixtures";

test.describe("editor console", () => {
  test("people who aren't editors are turned away", async ({ page }) => {
    await signIn(page, uniqueEmail("not-editor"));
    await page.goto("/admin");
    await expect(page.locator("h1")).toHaveText("This area is for editors");
    await page.goto("/dashboard");
    await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  });

  test("editors sign in and land back in the console", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/signin\?next=(%2F|\/)admin$/);
    await signIn(page, ADMIN_EMAIL, { path: page.url() });
    await expect(page).toHaveURL(/\/admin$/);
    // The overview lists what needs attention, including unchecked schemes.
    await expect(page.locator("main")).toContainText(/\d+ of \d+ schemes haven.t been checked against their official source/);
    await page.goto("/dashboard");
    await expect(page.locator('a[href="/admin"]')).toBeVisible();
  });

  test("a deep editor link survives sign-in", async ({ page }) => {
    await page.goto("/admin/schemes/birac-big");
    await expect(page).toHaveURL(/\/signin\?next=%2Fadmin%2Fschemes%2Fbirac-big$/);
    await signIn(page, ADMIN_EMAIL, { path: page.url() });
    await expect(page).toHaveURL(/\/admin\/schemes\/birac-big$/);
    await expect(page.locator("#hi-h")).toBeVisible();
  });

  test("scheme editor rejects unknown answers, saves and records the check", async ({ page }) => {
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/schemes/dpiit-startup-recognition" });
    const rule = page.locator("#rule");
    const original = await rule.inputValue();

    await rule.fill(original.replace('"entityType"', '"religion"'));
    await page.getByRole("button", { name: "Check rule" }).click();
    await expect(page.locator('main [role="status"]')).toContainText("isn't an answer the Scheme Scan collects");

    await rule.fill(original);
    await page.locator('aside input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator('main [role="status"]')).toContainText(/saved/i);

    await page.goto("/admin/schemes");
    const row = page.locator("tbody tr", { hasText: "DPIIT" }).first();
    await expect(row).not.toContainText("Not checked");

    // The public page shows the check date.
    const pub = await newVisitor(page.context().browser()!);
    await pub.goto("/schemes/dpiit-startup-recognition");
    await expect(pub.locator("main")).toContainText(/checked/i);
  });

  test("editing the English marks the Hindi out of date until it is updated", async ({ page, browser }) => {
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/schemes/birac-big" });
    const badge = page.locator("#hi-h + span");
    await expect(badge).toHaveText("Hindi up to date");

    const summary = page.locator("#summary");
    await summary.fill((await summary.inputValue()) + " Calls usually open twice a year.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(badge).toHaveText("Hindi out of date");

    // Hindi readers get the English with a note rather than a stale translation.
    const reader = await newVisitor(browser);
    await reader.goto("/hi/schemes/birac-big");
    await expect(reader.locator("main")).toContainText("इस योजना का हिन्दी विवरण अभी तैयार नहीं है");

    const hiSummary = page.locator('textarea[aria-label="Hindi summary"]');
    await hiSummary.fill((await hiSummary.inputValue()) + " कॉल आम तौर पर साल में दो बार खुलती है।");
    await page.getByRole("button", { name: "Save Hindi" }).click();
    await expect(badge).toHaveText("Hindi up to date");

    await reader.reload();
    await expect(reader.locator("main")).toContainText("कॉल आम तौर पर साल में दो बार खुलती है");
    await expect(reader.locator("main")).not.toContainText("इस योजना का हिन्दी विवरण अभी तैयार नहीं है");
  });

  test("publish an article and it is live straight away", async ({ page, browser }) => {
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/articles/new" });
    const title = `Your first 10 customers, by hand ${Date.now()}`;
    await page.locator("#title").fill(title);
    const slug = await page.locator("#slug").inputValue();
    expect(slug).toMatch(/^your-first-10-customers-by-hand-\d+$/);
    await page.locator("#excerpt").fill("Why the earliest sales should be slow, personal and slightly awkward.");
    await page
      .locator('textarea[aria-label="Article body in Markdown"]')
      .fill("## Start with people you can name\n\n" + "Write down twenty people who have the problem today and call them one by one. ".repeat(30));
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.locator(".prose-f h2")).toHaveText("Start with people you can name");
    await page.getByRole("button", { name: "Publish today" }).click();
    await expect(page).not.toHaveURL(/\/admin\/articles\/new$/);

    const reader = await newVisitor(browser);
    const res = await reader.goto(`/learn/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(reader.locator("h1")).toHaveText(title);
    await reader.goto("/learn");
    await expect(reader.locator("main")).toContainText(title);
  });

  test("import events from a CSV and they appear on the events page", async ({ page, browser }) => {
    await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/imports" });
    const name = `Test founder meetup ${Date.now()}`;
    const csv =
      "Event,Start,End,City / venue,Country,Scope,Type,Status,Key deadline,Best for,Cost & notes,Source,Last checked\n" +
      `${name},15/01/2027,15/01/2027,Bengaluru,India,India,Meetup,To verify,,Early founders,Free,[Example](https://example.com/meetup),22/11/2026\n`;
    await page.locator('input[type="file"]').first().setInputFiles({ name: "events.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await page.getByRole("button", { name: "Import events" }).click();
    await expect(page.locator('main [role="status"]')).toContainText(/1/);

    const reader = await newVisitor(browser);
    await reader.goto("/events");
    await expect(reader.locator("main")).toContainText(name);

    // The audit log records the import against the editor, without storing their email.
    await page.goto("/admin/audit");
    const entry = page.locator("ol li").first();
    await expect(entry).toContainText("Imported events csv (1 rows)");
    await expect(entry).toContainText("Editor");
    await expect(entry).not.toContainText(ADMIN_EMAIL);
  });
});

test("weekly scheme alerts: editor sends, subscriber unsubscribes from the link", async ({ page, browser }) => {
  // A founder who asked for alerts, with a profile to match against.
  const email = uniqueEmail("alerts");
  const f = await newVisitor(browser);
  await signIn(f, email, { consents: [/Scheme and deadline alerts/] });
  await f.locator("#name").fill("Alert Labs");
  await f.locator("#entity").selectOption("private_limited");
  await f.locator("#st").selectOption("KA");
  await f.locator("#stage").selectOption("prototype");
  await f.getByRole("button", { name: "Create profile" }).click();
  await expect(f.getByText("Profile created.")).toBeVisible();

  await signIn(page, ADMIN_EMAIL, { path: "/signin?next=/admin/alerts" });
  await expect(page.locator("pre")).toBeVisible(); // the preview
  await page.getByRole("button", { name: "Send this week's email now" }).click();
  await expect(page.locator('main [role="status"]')).toContainText(/Sent [1-9]\d* of/);
  // Sending again doesn't email anyone twice.
  await page.getByRole("button", { name: "Send this week's email now" }).click();
  await expect(page.locator('main [role="status"]')).toContainText(/Sent 0 of/);
  await expect(page.locator('main [role="status"]')).toContainText("already had this week's email");

  // A tampered link is refused.
  const link = await unsubscribeLink(email);
  const reader = await newVisitor(browser);
  await reader.goto(link.replace(/t=[^&]+/, `t=${"x".repeat(43)}`));
  await reader.getByRole("button", { name: "Stop scheme alerts" }).click();
  await expect(reader.locator('main [role="alert"]')).toContainText("This link didn't work");

  // The real link works without signing in.
  await reader.goto(link);
  await reader.getByRole("button", { name: "Stop scheme alerts" }).click();
  await expect(reader.locator('main [role="status"]')).toContainText("Scheme alerts are off.");

  // The founder's dashboard shows alerts off.
  await f.reload();
  await expect(f.locator("#privacy-h ~ ul li", { hasText: "Scheme and deadline alerts" }).locator("button")).toHaveText("Off");
});
