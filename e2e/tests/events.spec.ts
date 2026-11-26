import { createServer, type Server } from "node:http";
import { ADMIN_EMAIL } from "../playwright.config";
import { dbExec, expect, newVisitor, signIn, test } from "./fixtures";

test.describe("events calendar", () => {
  test("month grid: navigate, pick a day, see its events and add one to a calendar", async ({ page }) => {
    await page.goto("/events?month=2027-01");
    await expect(page.locator("main h2").first()).toHaveText("January 2027");
    const grid = page.getByRole("grid", { name: "January 2027" });
    await expect(grid.getByRole("columnheader")).toHaveText(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    // CES runs 6 to 9 January.
    const day7 = grid.getByRole("button", { name: /^7 Jan, \d+ events?$/ });
    await expect(day7).toContainText("CES 2027");
    await day7.click();
    await expect(page.locator("#day-h")).toHaveText("7 Jan 2027");
    const ces = page.locator("section[aria-labelledby=day-h] ul li", { hasText: "CES 2027" });
    await expect(ces).toBeVisible();
    await expect(ces.getByRole("link", { name: "Add to Google Calendar" })).toHaveAttribute("href", /calendar\.google\.com\/calendar\/render\?action=TEMPLATE.*dates=20270106%2F20270110/);
    await page.getByRole("button", { name: "Show the whole month" }).click();
    await expect(page.locator("#day-h")).toHaveText("Events in January 2027");

    await page.getByRole("link", { name: "Next month" }).click();
    await expect(page).toHaveURL(/month=2027-02/);
    await expect(page.locator("main h2").first()).toHaveText("February 2027");
    await page.getByRole("link", { name: "This month" }).click();
    await expect(page).toHaveURL(new RegExp(`month=${new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 7)}`));
  });

  test("filters by region and format, in both views", async ({ page }) => {
    await page.goto("/events?month=2027-03");
    await expect(page.locator("section[aria-labelledby=day-h] ul")).toContainText("SXSW 2027");
    await page.locator('select[name="region"]').selectOption("Europe");
    await page.getByRole("button", { name: "Show", exact: true }).click();
    await expect(page).toHaveURL(/region=Europe/);
    await expect(page).toHaveURL(/month=2027-03/);
    await expect(page.locator("section[aria-labelledby=day-h] ul")).not.toContainText("SXSW 2027");
    await expect(page.locator("section[aria-labelledby=day-h] ul")).toContainText("MWC Barcelona");

    await page.getByRole("link", { name: "List" }).click();
    await expect(page).toHaveURL(/view=list/);
    await expect(page).toHaveURL(/region=Europe/);
    const list = page.locator("main ul").first();
    await expect(list).toContainText("London Tech Week 2027");
    await expect(list).not.toContainText("LEAP 2027");

    // Old links still work.
    await page.goto("/events?scope=India&view=list");
    await expect(page.locator('select[name="region"]')).toHaveValue("India");
  });

  test("filter by kind: open innovation challenges", async ({ page, request }) => {
    await page.goto("/events?view=list");
    await page.locator('select[name="type"]').selectOption("Challenge");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(page).toHaveURL(/type=Challenge/);
    const list = page.locator("main ul").first();
    await expect(list).toContainText("The Liveability Challenge 2027");
    await expect(list).toContainText("Open innovation challenge");
    await expect(list).not.toContainText("CES 2027");
    const feed = await (await request.get("/calendar/foundura-events.ics?type=Challenge")).text();
    expect(feed).toContain("Liveability Challenge");
    expect(feed).not.toContain("CES 2027");
  });

  test("calendar feeds: subscribe links and the .ics files", async ({ page, request }) => {
    await page.goto("/events?region=Americas");
    const apple = page.getByRole("link", { name: "Apple Calendar or Outlook" });
    await expect(apple).toHaveAttribute("href", /^webcal:\/\/.*\/calendar\/foundura-events\.ics\?region=Americas$/);
    await expect(page.getByRole("link", { name: "Google Calendar", exact: true })).toHaveAttribute("href", /calendar\.google\.com\/calendar\/r\?cid=webcal/);

    const feed = await request.get("/calendar/foundura-events.ics?region=Americas");
    expect(feed.status()).toBe(200);
    expect(feed.headers()["content-type"]).toContain("text/calendar");
    const text = await feed.text();
    expect(text).toContain("SUMMARY:SXSW 2027");
    expect(text).not.toContain("LEAP 2027");
    for (const line of text.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);

    await page.goto("/events?view=list&region=Americas");
    const href = await page.locator("main li", { hasText: "SXSW 2027" }).getByRole("link", { name: "Download for Outlook or Apple Calendar" }).getAttribute("href");
    const one = await request.get(href!);
    expect(one.headers()["content-disposition"]).toContain("attachment");
    expect((await one.text()).match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect((await request.get("/calendar/no-such-event.ics")).status()).toBe(404);
  });

  test("Hindi calendar", async ({ page }) => {
    await page.goto("/hi/events?month=2027-01");
    await expect(page.getByRole("grid").getByRole("columnheader").first()).toHaveText("सोम");
    await expect(page.locator("#day-h")).toContainText("के कार्यक्रम");
    await expect(page.getByRole("link", { name: "Google कैलेंडर", exact: true })).toBeVisible();
  });
});

test.describe("event sources", () => {
  let server: Server;
  const FEED = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "BEGIN:VEVENT", "UID:e2e-1", "SUMMARY:Bengaluru Hardware Demo Night", "DTSTART;VALUE=DATE:20270210", "DTEND;VALUE=DATE:20270211", "LOCATION:IISc\\, Bengaluru\\, India", "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  test.beforeAll(async () => {
    server = createServer((_req, res) => res.writeHead(200, { "content-type": "text/calendar" }).end(FEED));
    await new Promise<void>((r) => server.listen(3103, "127.0.0.1", r));
  });
  test.afterAll(() => new Promise<void>((r) => server.close(() => r())));

  test("an editor adds a source, reads it, and publishes what it imported", async ({ browser }) => {
    const ed = await newVisitor(browser);
    await signIn(ed, ADMIN_EMAIL, { path: "/signin?next=/admin/events" });
    await expect(ed).toHaveURL(/\/admin\/events$/);
    const name = `Demo nights ${Date.now()}`;
    await ed.getByLabel("Name").fill(name);
    await ed.getByLabel("Address (https://)").fill("https://organiser.example/feed.ics");
    await ed.getByLabel("Events are").selectOption("India");
    await ed.getByLabel("Type for its events").fill("Pitch day");
    await ed.getByRole("button", { name: "Add source" }).click();
    await expect(ed.locator('[role="status"]')).toContainText(`Added ${name}`);
    // Editors can only enter https; point this one at the stand-in feed on this machine.
    await dbExec("update event_sources set url = $1 where name = $2", ["http://127.0.0.1:3103/feed.ics", name]);

    const row = ed.locator("#sources-h ~ ul > li", { hasText: name });
    await row.getByRole("button", { name: "Read now" }).click();
    await expect(row).toContainText("Found 1: 1 new");

    const pending = ed.locator("#queue-h ~ ul > li", { hasText: "Bengaluru Hardware Demo Night" });
    await expect(pending).toContainText("Not public yet");
    const visitor = await newVisitor(browser);
    await visitor.goto("/events?month=2027-02");
    await expect(visitor.locator("section[aria-labelledby=day-h] ul")).not.toContainText("Bengaluru Hardware Demo Night");

    await pending.getByRole("button", { name: "Confirm dates" }).click();
    await expect(ed.locator("#queue-h ~ ul > li", { hasText: "Bengaluru Hardware Demo Night" })).toHaveCount(0);
    await visitor.reload();
    const card = visitor.locator("section[aria-labelledby=day-h] ul li", { hasText: "Bengaluru Hardware Demo Night" });
    await expect(card).toContainText("IISc, Bengaluru, Pitch day");

    await ed.goto("/admin/audit");
    await expect(ed.locator("ol li").first()).toContainText("Confirmed event dates");
  });
});
