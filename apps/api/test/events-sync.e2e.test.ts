import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { productionProblems, loadConfig } from "../src/config";
import { ADMIN_KEY, startTestApp } from "./helpers";

// A stand-in organiser site: an iCalendar feed and a page with schema.org Event data.
let feed = "";
let page = "";
let server: Server;
let base = "";
const ics = (events: string[]) => ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n");
const vevent = (uid: string, name: string, start: string, end: string, location: string) =>
  ["BEGIN:VEVENT", `UID:${uid}`, `SUMMARY:${name}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `LOCATION:${location}`, "END:VEVENT"].join("\r\n");

let app: INestApplication;
let http: ReturnType<typeof request>;
const admin = { "x-admin-key": ADMIN_KEY };

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/feed.ics") res.writeHead(200, { "content-type": "text/calendar" }).end(feed);
    else if (req.url === "/events") res.writeHead(200, { "content-type": "text/html" }).end(page);
    else if (req.url === "/moved") res.writeHead(302, { location: "/feed.ics" }).end();
    else res.writeHead(404).end();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  ({ app, http } = await startTestApp({ EVENT_SYNC_ALLOW_PRIVATE: "true" }));
});
afterAll(async () => {
  await app?.close();
  await new Promise((r) => server.close(r));
});

describe("event sources and sync", () => {
  let feedId = "";

  it("only editors can manage sources, and sources must be https", async () => {
    await http.get("/v1/admin/event-sources").expect(401);
    await http.post("/v1/admin/event-sources").set(admin).send({ name: "Bad", url: "http://plain.example.com/feed.ics", kind: "ics", scope: "Global" }).expect(400);
  });

  it("imports an untrusted feed as unpublished events waiting for review", async () => {
    feed = ics([
      vevent("a1", "Singapore Founders Week", "20270315", "20270318", "Marina Bay Sands, Singapore"),
      vevent("a2", "Online pitch night", "20270402", "20270403", "Zoom"),
      vevent("old", "Last year's meetup", "20250101", "20250102", "Pune, India"),
    ]);
    // Sources are stored with https; the test server is http, which only this test config allows.
    const src = await http.post("/v1/admin/event-sources").set(admin).send({ name: "Founders Week", url: `https://placeholder.example/feed.ics`, kind: "ics", scope: "Global" }).expect(201);
    feedId = src.body.id;
    await http.patch(`/v1/admin/event-sources/${feedId}`).set(admin).send({}).expect(200);
    // Point it at the local server directly in the database-facing API (editors can't enter http).
    await setUrl(feedId, `${base}/moved`);

    const r = await http.post(`/v1/admin/event-sources/${feedId}/sync`).set(admin).expect(200);
    expect(r.body).toMatchObject({ found: 3, added: 2, skipped: 1 });

    const pub = (await http.get("/v1/events?all=1").expect(200)).body as Array<{ name: string }>;
    expect(pub.map((e) => e.name)).not.toContain("Singapore Founders Week");

    const queue = (await http.get("/v1/admin/events/review").set(admin).expect(200)).body as Array<{ event: { id: string; name: string; status: string; published: boolean; country: string; format: string }; sourceName: string }>;
    const sg = queue.find((q) => q.event.name === "Singapore Founders Week")!;
    expect(sg).toMatchObject({ sourceName: "Founders Week", event: { status: "To verify", published: false, country: "Singapore", format: "In person" } });
    expect(queue.find((q) => q.event.name === "Online pitch night")!.event).toMatchObject({ country: "Online", format: "Online" });

    await http.post(`/v1/admin/events/${sg.event.id}/review`).set(admin).send({ action: "publish" }).expect(200);
    const after = (await http.get("/v1/events?all=1").expect(200)).body as Array<{ name: string; status: string; region: string }>;
    expect(after.find((e) => e.name === "Singapore Founders Week")).toMatchObject({ status: "To verify", region: "Asia-Pacific" });

    const sources = (await http.get("/v1/admin/event-sources").set(admin).expect(200)).body as Array<{ id: string; lastResult: string; lastError: string | null }>;
    expect(sources.find((s) => s.id === feedId)).toMatchObject({ lastResult: "Found 3: 2 new, 0 updated, 0 unchanged, 1 past or too far ahead.", lastError: null });
  });

  it("updates an event when the source changes its dates, and sends it back for checking", async () => {
    const queue0 = (await http.get("/v1/admin/events/review").set(admin).expect(200)).body as Array<{ event: { id: string; name: string } }>;
    const id = queue0.find((q) => q.event.name === "Singapore Founders Week")!.event.id;
    await http.post(`/v1/admin/events/${id}/review`).set(admin).send({ action: "confirm" }).expect(200);

    feed = ics([vevent("a1", "Singapore Founders Week", "20270322", "20270325", "Marina Bay Sands, Singapore"), vevent("a2", "Online pitch night", "20270402", "20270403", "Zoom")]);
    const r = await http.post(`/v1/admin/event-sources/${feedId}/sync`).set(admin).expect(200);
    expect(r.body).toMatchObject({ found: 2, added: 0, updated: 1, unchanged: 1 });
    const list = (await http.get("/v1/events?all=1").expect(200)).body as Array<{ name: string; startDate: string; status: string }>;
    expect(list.find((e) => e.name === "Singapore Founders Week")).toMatchObject({ startDate: "2027-03-22", status: "To verify" });
  });

  it("publishes events from a trusted page source as confirmed", async () => {
    page = `<script type="application/ld+json">{"@type":"Event","name":"Lisbon Demo Day","startDate":"2027-05-10","endDate":"2027-05-11","url":"https://example.org/demo",
      "location":{"@type":"Place","name":"FIL","address":{"addressLocality":"Lisbon","addressCountry":"Portugal"}}}</script>`;
    const src = await http.post("/v1/admin/event-sources").set(admin).send({ name: "Demo days", url: "https://placeholder.example/events", kind: "page", scope: "Global", trusted: true, defaultType: "Pitch day" }).expect(201);
    await setUrl(src.body.id, `${base}/events`);
    await http.post(`/v1/admin/event-sources/${src.body.id}/sync`).set(admin).expect(200);
    const list = (await http.get("/v1/events?region=Europe").expect(200)).body as Array<{ name: string; status: string; type: string; region: string; sourceUrl: string }>;
    expect(list.find((e) => e.name === "Lisbon Demo Day")).toMatchObject({ status: "Confirmed", type: "Pitch day", region: "Europe", sourceUrl: "https://example.org/demo" });
    expect(JSON.stringify(list)).not.toContain("externalId");
  });

  it("a failing source records the error and leaves events alone", async () => {
    const src = await http.post("/v1/admin/event-sources").set(admin).send({ name: "Broken", url: "https://placeholder.example/missing", kind: "ics", scope: "India" }).expect(201);
    await setUrl(src.body.id, `${base}/missing`);
    const r = await http.post(`/v1/admin/event-sources/${src.body.id}/sync`).set(admin).expect(200);
    expect(r.body.error).toBe("The source answered 404");
  });
});

describe("calendar queries and feeds", () => {
  it("returns events that overlap a month, filtered by region and format", async () => {
    const march = (await http.get("/v1/events?from=2027-03-01&to=2027-03-31").expect(200)).body as Array<{ name: string }>;
    expect(march.map((e) => e.name)).toContain("Singapore Founders Week");
    expect(march.map((e) => e.name)).not.toContain("Lisbon Demo Day");
    const online = (await http.get("/v1/events?all=1&format=Online").expect(200)).body as Array<{ format: string }>;
    expect(online.every((e) => e.format === "Online")).toBe(true);
    await http.get("/v1/events?region=Mars").expect(400);
    await http.get("/v1/events?from=March").expect(400);
  });

  it("serves a subscribable feed and a single-event file", async () => {
    const feedRes = await http.get("/v1/events/calendar.ics?region=Europe").expect(200);
    expect(feedRes.headers["content-type"]).toContain("text/calendar");
    expect(feedRes.text).toContain("X-WR-CALNAME:Foundura: startup events (Europe)");
    expect(feedRes.text).toContain("SUMMARY:Lisbon Demo Day");
    expect(feedRes.text).not.toContain("Singapore Founders Week");
    const list = (await http.get("/v1/events?region=Europe").expect(200)).body as Array<{ slug: string; name: string }>;
    const slug = list.find((e) => e.name === "Lisbon Demo Day")!.slug;
    const one = await http.get(`/v1/events/${slug}/ics`).expect(200);
    expect(one.text.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    await http.get("/v1/events/no-such-event/ics").expect(404);
  });

  it("hidden events stay out of the list and the feeds", async () => {
    const queue = (await http.get("/v1/admin/events/review").set(admin).expect(200)).body as Array<{ event: { id: string; name: string } }>;
    const online = queue.find((q) => q.event.name === "Online pitch night")!;
    await http.post(`/v1/admin/events/${online.event.id}/review`).set(admin).send({ action: "hide" }).expect(200);
    expect((await http.get("/v1/events/calendar.ics").expect(200)).text).not.toContain("Online pitch night");
  });
});

it("production refuses to let event sources reach the local network", () => {
  const c = loadConfig({ DATABASE_URL: "x", JWT_SECRET: "x".repeat(40), ADMIN_API_KEY: "y".repeat(30), EVENT_SYNC_ALLOW_PRIVATE: "true" });
  expect(productionProblems(c).join(" ")).toContain("EVENT_SYNC_ALLOW_PRIVATE");
});

/** Test-only: point a source at the local stand-in server, which editors can't enter (http, loopback). */
async function setUrl(id: string, url: string) {
  const { createDb } = await import("../src/db/client");
  const { eventSources } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");
  const { DATABASE_URL } = await import("./helpers");
  const { db, pool } = createDb(DATABASE_URL);
  await db.update(eventSources).set({ url }).where(eq(eventSources.id, id));
  await pool.end();
}
