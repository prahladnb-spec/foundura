import type { events } from "../db/schema";

type EventRow = typeof events.$inferSelect;

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const day = (d: string) => d.replace(/-/g, "");
const plusDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** Folds a content line at 75 octets, as RFC 5545 requires, without splitting a UTF-8 character. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

const STATUS: Record<string, string> = { Confirmed: "CONFIRMED", Cancelled: "CANCELLED" };

/**
 * An iCalendar feed of events, as all-day entries. Calendar apps that subscribe re-read it about every
 * 12 hours, so new and changed events reach founders' own calendars. Deadline-only items become an
 * entry on the deadline day.
 */
export function toIcs(rows: EventRow[], siteUrl: string, name = "Foundura: startup events"): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Foundura//Startup events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    "X-WR-CALDESC:Startup expos\\, summits\\, pitch days and deadlines from foundura.org",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];
  for (const e of rows) {
    const start = e.startDate ?? e.deadline;
    if (!start) continue;
    const deadlineOnly = !e.startDate;
    const end = deadlineOnly ? start : (e.endDate ?? start);
    const where = [e.city, e.country].filter((x) => x && x !== "Worldwide").join(", ");
    const desc = [
      e.bestFor && `Best for: ${e.bestFor}`,
      e.notes,
      e.deadline && !deadlineOnly && `Apply by ${e.deadline}`,
      e.status !== "Confirmed" && e.status !== "Cancelled" && `Dates not yet confirmed by the organiser (${e.status.toLowerCase()}).`,
      e.sourceUrl && `Source: ${e.sourceUrl}`,
      `More events: ${siteUrl}/events`,
    ]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.slug}@foundura.org`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(start)}`,
      `DTEND;VALUE=DATE:${day(plusDay(end))}`,
      (`SUMMARY:${esc(deadlineOnly ? `Deadline: ${e.name}` : e.name)}`),
      ...(where ? [(`LOCATION:${esc(e.format === "Online" ? "Online" : where)}`)] : []),
      ...(e.sourceUrl ? [(`URL:${e.sourceUrl}`)] : []),
      (`DESCRIPTION:${esc(desc)}`),
      `STATUS:${STATUS[e.status] ?? "TENTATIVE"}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  // Every line, including the calendar's own header lines, must fit in 75 octets.
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
