import { DICTS } from "../../apps/web/src/i18n/dicts";
import { ROUNDS, roundId, roundsByDate } from "../../apps/web/src/rounds/rounds";
import { expect, test } from "./fixtures";

const en = DICTS.en.rounds;

test.describe("funding rounds", () => {
  test("lists every round newest first, each with its source and a report link", async ({ page }) => {
    await page.goto("/rounds");
    await expect(page.locator("h1")).toHaveText(en.title);
    const items = page.locator("ol > li[id]");
    await expect(items).toHaveCount(ROUNDS.length);
    await expect(items.first()).toHaveAttribute("id", roundId(roundsByDate()[0]));
    await expect(page.getByText(/not yet checked by our team/)).toBeVisible();
    const first = items.first();
    await expect(first.getByRole("link", { name: /^Reported by / })).toHaveAttribute("target", "_blank");
    await expect(first.getByRole("link", { name: new RegExp(`^${en.report}`) })).toHaveAttribute("href", /^mailto:/);
  });

  test("the sector and round filters narrow the list", async ({ page }) => {
    await page.goto("/rounds");
    await page.getByLabel(en.round).selectOption("series-a");
    await page.getByRole("button", { name: en.show }).click();
    await expect(page).toHaveURL(/round=series-a/);
    const n = ROUNDS.filter((r) => r.round === "series-a").length;
    await expect(page.locator("ol > li[id]")).toHaveCount(n);
    await expect(page.getByText(`${n} rounds`)).toBeVisible();
  });

  test("is part of open data and linked from the funding directory", async ({ page, request }) => {
    const csv = await (await request.get("/data/rounds.csv")).text();
    expect(csv.split("\n")[0]).toContain("amount_as_reported");
    await page.goto("/funding");
    await page.getByRole("main").getByRole("link", { name: en.title, exact: true }).click();
    await expect(page).toHaveURL(/\/rounds$/);
  });
});

test.describe("feeds", () => {
  test("each Atom feed is served and its page points to it", async ({ page, request }) => {
    for (const id of ["policy", "guides", "events", "rounds"]) {
      const res = await request.get(`/feeds/${id}.xml`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/atom+xml");
      const xml = await res.text();
      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
      expect(xml).toContain("<entry>");
    }
    const rounds = await (await request.get("/feeds/rounds.xml")).text();
    expect(rounds.match(/<entry>/g)?.length).toBe(Math.min(ROUNDS.length, 50));
    expect((await request.get("/feeds/nothing.xml")).status()).toBe(404);
    for (const [path, id] of [["/rounds", "rounds"], ["/policy", "policy"], ["/learn", "guides"], ["/events", "events"]]) {
      await page.goto(path);
      await expect(page.locator(`head link[rel=alternate][type="application/atom+xml"][href="/feeds/${id}.xml"]`)).toHaveCount(1);
    }
    await page.goto("/data");
    await expect(page.locator("#feeds-h ~ ul a")).toHaveCount(4);
  });
});
