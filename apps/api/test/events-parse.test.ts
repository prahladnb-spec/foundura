import { describe, expect, it } from "vitest";
import { toIcs } from "../src/events/ics";
import { cityAndCountry, parseIcs, parseJsonLdEvents } from "../src/events/parse";
import { isPrivateAddress, safeFetchText } from "../src/events/safe-fetch";

const ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "UID:abc-1@organiser.example",
  "SUMMARY:Founders\\, Funders and Friends",
  "DTSTART;VALUE=DATE:20270315",
  "DTEND;VALUE=DATE:20270318",
  "LOCATION:Hall 3\\, Singapore Expo\\, Singapore",
  "URL:https://organiser.example/fff",
  "DESCRIPTION:A long description that is folded across",
  "  two lines.",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:abc-2",
  "SUMMARY:Investor office hours",
  "DTSTART;TZID=Asia/Kolkata:20270402T170000",
  "DTEND;TZID=Asia/Kolkata:20270402T180000",
  "LOCATION:Zoom",
  "STATUS:CANCELLED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "SUMMARY:No date, skipped",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("iCalendar parsing", () => {
  it("reads all-day and timed events, unescapes text, and treats all-day end dates as exclusive", () => {
    const [a, b, ...rest] = parseIcs(ICS);
    expect(rest).toHaveLength(0);
    expect(a).toMatchObject({ externalId: "abc-1@organiser.example", name: "Founders, Funders and Friends", startDate: "2027-03-15", endDate: "2027-03-17", location: "Hall 3, Singapore Expo, Singapore", url: "https://organiser.example/fff", format: "In person", cancelled: false });
    expect(b).toMatchObject({ startDate: "2027-04-02", endDate: "2027-04-02", format: "Online", cancelled: true });
  });

  it("splits city and country, falling back to the source's scope", () => {
    expect(cityAndCountry("Hall 3, Singapore Expo, Singapore", "Global")).toEqual({ city: "Hall 3, Singapore Expo", country: "Singapore" });
    expect(cityAndCountry("IIT Madras Research Park", "India")).toEqual({ city: "IIT Madras Research Park", country: "India" });
    expect(cityAndCountry(null, "Global")).toEqual({ city: null, country: "Online" });
  });
});

describe("schema.org Event parsing", () => {
  it("finds events in JSON-LD, including @graph, online and hybrid ones, and skips broken blocks", () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"X"},
        {"@type":"BusinessEvent","name":"Demo Day","startDate":"2027-05-20T10:00:00+05:30","endDate":"2027-05-20",
         "location":{"@type":"Place","name":"T-Hub","address":{"addressLocality":"Hyderabad","addressCountry":"India"}},"url":"https://hub.example/demo-day"}]}</script>
      <script type="application/ld+json">[{"@type":"Event","name":"Pitch online","startDate":"2027-06-01","location":{"@type":"VirtualLocation","url":"https://zoom.us/x"},"eventAttendanceMode":"https://schema.org/OnlineEventAttendanceMode"},
        {"@type":"Event","name":"Hybrid summit","startDate":"2027-07-01","eventAttendanceMode":"https://schema.org/MixedEventAttendanceMode","eventStatus":"https://schema.org/EventCancelled","location":"Berlin, Germany"}]</script>
      <script type="application/ld+json">{ not json }</script></head></html>`;
    const out = parseJsonLdEvents(html, "https://hub.example/events");
    expect(out.map((e) => [e.name, e.startDate, e.format, e.cancelled])).toEqual([
      ["Demo Day", "2027-05-20", "In person", false],
      ["Pitch online", "2027-06-01", "Online", false],
      ["Hybrid summit", "2027-07-01", "Hybrid", true],
    ]);
    expect(out[0]).toMatchObject({ location: "T-Hub, Hyderabad, India", url: "https://hub.example/demo-day", externalId: "https://hub.example/demo-day" });
    expect(out[1].url).toBe("https://hub.example/events");
  });
});

describe("iCalendar output", () => {
  it("uses CRLF, escapes text, folds long lines within 75 octets and makes all-day ends exclusive", () => {
    const row = {
      id: "1", slug: "big-summit-2027", name: "Big Summit; founders, funders", startDate: "2027-03-15", endDate: "2027-03-17", city: "Bengaluru — BIEC", country: "India",
      scope: "India", type: "Summit", status: "To verify", deadline: null, bestFor: "Very long text ".repeat(20), notes: null, sourceUrl: "https://example.com/s", sourceName: "S",
      lastChecked: null, format: "In person", published: true, sourceId: null, externalId: null, createdAt: new Date(), updatedAt: new Date(),
    };
    const ics = toIcs([row], "https://foundura.org");
    expect(ics).toContain("\r\nSUMMARY:Big Summit\; founders\\, funders\r\n");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270315\r\nDTEND;VALUE=DATE:20270318");
    expect(ics).toContain("STATUS:TENTATIVE");
    for (const line of ics.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    // What we write, we can read back.
    expect(parseIcs(ics)[0]).toMatchObject({ name: "Big Summit; founders, funders", startDate: "2027-03-15", endDate: "2027-03-17" });
  });
});

describe("fetching sources safely", () => {
  it("recognises private and loopback addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.20.0.5", "192.168.1.1", "169.254.169.254", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) expect(isPrivateAddress(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "142.250.183.14", "2606:4700::1111"]) expect(isPrivateAddress(ip), ip).toBe(false);
  });

  it("refuses http and private hosts", async () => {
    await expect(safeFetchText("http://example.com/feed.ics")).rejects.toThrow("Only https://");
    await expect(safeFetchText("https://127.0.0.1/feed.ics")).rejects.toThrow("private network");
    await expect(safeFetchText("https://localhost/feed.ics")).rejects.toThrow("private network");
  });
});
