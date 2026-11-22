import type { EventItem } from "@/lib/types";

/** Month in the form 2027-03. Falls back to the current month in India. */
export function parseMonth(m: string | undefined, today = new Date()): string {
  if (m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m)) return m;
  return new Date(today.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 7);
}

const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  return { from: `${month}-01`, to: `${month}-${pad(daysIn(y, m))}` };
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** Weeks for a month grid, Monday first. Days outside the month are null. */
export function monthGrid(month: string): (string | null)[][] {
  const [y, m] = month.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn(y, m) }, (_, i) => `${month}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** Whether an event is on a given day: inside its dates, or on its deadline if it has no dates. */
export function onDay(e: EventItem, day: string): boolean {
  if (e.startDate) return e.startDate <= day && day <= (e.endDate ?? e.startDate);
  return e.deadline === day;
}

export function monthLabel(month: string, lang: "en" | "hi"): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
}

const plusDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** A Google Calendar link that adds one event; nothing is sent to Foundura. */
export function googleAddLink(e: EventItem, site: string): string | null {
  const start = e.startDate ?? e.deadline;
  if (!start) return null;
  const end = plusDay(e.startDate ? (e.endDate ?? e.startDate) : start);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.startDate ? e.name : `Deadline: ${e.name}`,
    dates: `${start.replace(/-/g, "")}/${end.replace(/-/g, "")}`,
    details: [e.bestFor && `Best for: ${e.bestFor}`, e.sourceUrl, `${site}/events`].filter(Boolean).join("\n"),
    location: e.format === "Online" ? "Online" : [e.city, e.country].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** The calendar feed address for a set of filters, on this site. */
export function feedPath(filters: { region?: string; format?: string }): string {
  const q = new URLSearchParams();
  if (filters.region) q.set("region", filters.region);
  if (filters.format) q.set("format", filters.format);
  return `/calendar/foundura-events.ics${q.size ? `?${q}` : ""}`;
}
