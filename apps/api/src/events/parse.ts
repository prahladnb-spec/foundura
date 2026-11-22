import { type EventFormat, regionOf } from "@foundura/shared";

/** An event as read from a source, before it is matched against what we already hold. */
export interface ParsedEvent {
  externalId: string;
  name: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  url: string | null;
  format: EventFormat;
  cancelled: boolean;
}

const ymd = (v: string): string | null => {
  const m = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(v.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};
const minusDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
const ONLINE = /\b(online|virtual|zoom|webinar|livestream|google meet|teams)\b/i;
const clean = (s: string | null | undefined, max: number) => (s ? s.replace(/\s+/g, " ").trim().slice(0, max) || null : null);

// ----- iCalendar (RFC 5545) -----

function unescapeIcs(v: string) {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

/** Reads the VEVENTs in an iCalendar feed. Unknown properties are ignored. */
export function parseIcs(text: string): ParsedEvent[] {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const out: ParsedEvent[] = [];
  let cur: Record<string, { value: string; params: string }> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT" && cur) {
      const start = cur.DTSTART && ymd(cur.DTSTART.value);
      const name = clean(cur.SUMMARY && unescapeIcs(cur.SUMMARY.value), 200);
      if (start && name) {
        const allDay = /VALUE=DATE(?!-)/i.test(cur.DTSTART.params) || /^\d{8}$/.test(cur.DTSTART.value.trim());
        let end = cur.DTEND ? ymd(cur.DTEND.value) : null;
        // All-day DTEND is exclusive: an event on the 15th ends on the 16th.
        if (end && allDay) end = minusDay(end);
        if (end && end < start) end = start;
        const location = clean(cur.LOCATION && unescapeIcs(cur.LOCATION.value), 200);
        const url = cur.URL?.value.trim() || null;
        out.push({
          externalId: (cur.UID?.value.trim() || `${name}|${start}`).slice(0, 300),
          name,
          startDate: start,
          endDate: end,
          location,
          url: url && /^https?:\/\//.test(url) ? url : null,
          // No location, or a location like "Zoom", means an online event.
          format: location && !ONLINE.test(location) ? "In person" : "Online",
          cancelled: /CANCELLED/i.test(cur.STATUS?.value ?? ""),
        });
      }
      cur = null;
    } else if (cur) {
      const m = /^([A-Za-z-]+)((?:;[^:]*)?):(.*)$/.exec(line);
      if (m && !cur[m[1].toUpperCase()]) cur[m[1].toUpperCase()] = { params: m[2], value: m[3] };
    }
  }
  return out;
}

// ----- schema.org Event in JSON-LD -----

type Node = Record<string, unknown>;
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const isEvent = (n: Node) => {
  const t = n["@type"];
  return (Array.isArray(t) ? t : [t]).some((x) => typeof x === "string" && /Event$/.test(x));
};

function placeText(loc: unknown): { text: string | null; online: boolean } {
  if (!loc) return { text: null, online: false };
  if (Array.isArray(loc)) {
    const parts = loc.map(placeText);
    return { text: parts.map((p) => p.text).filter(Boolean).join(", ") || null, online: parts.some((p) => p.online) };
  }
  if (typeof loc === "string") return { text: loc, online: ONLINE.test(loc) };
  const n = loc as Node;
  if (n["@type"] === "VirtualLocation") return { text: null, online: true };
  const a = n.address;
  const addr = typeof a === "string" ? a : a && typeof a === "object" ? [str((a as Node).addressLocality), countryName((a as Node).addressCountry)].filter(Boolean).join(", ") : null;
  return { text: [str(n.name), addr].filter(Boolean).join(", ") || null, online: false };
}
const countryName = (c: unknown) => (typeof c === "string" ? c : c && typeof c === "object" ? str((c as Node).name) : null);

/** Reads schema.org Event objects from the JSON-LD blocks of a web page. */
export function parseJsonLdEvents(html: string, pageUrl: string): ParsedEvent[] {
  const out: ParsedEvent[] = [];
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const visit = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (!v || typeof v !== "object") return;
    const n = v as Node;
    if (Array.isArray(n["@graph"])) (n["@graph"] as unknown[]).forEach(visit);
    if (!isEvent(n)) return;
    const name = clean(str(n.name), 200);
    const start = str(n.startDate) && ymd(str(n.startDate)!);
    if (!name || !start) return;
    const end = str(n.endDate) ? ymd(str(n.endDate)!) : null;
    const place = placeText(n.location);
    const mode = str(n.eventAttendanceMode) ?? "";
    const url = str(n.url);
    out.push({
      externalId: (url || `${name}|${start}`).slice(0, 300),
      name,
      startDate: start,
      endDate: end && end >= start ? end : null,
      location: clean(place.text, 200),
      url: url && /^https?:\/\//.test(url) ? url : pageUrl,
      format: /Mixed/.test(mode) ? "Hybrid" : /Online/.test(mode) || (place.online && !place.text) ? "Online" : "In person",
      cancelled: /Cancelled/i.test(str(n.eventStatus) ?? ""),
    });
  };
  for (const [, body] of blocks) {
    try {
      visit(JSON.parse(body.trim()));
    } catch {
      // A broken block on someone else's page; skip it.
    }
  }
  return out;
}

/** Splits a free-text location into city and country. The country falls back to the source's scope. */
export function cityAndCountry(location: string | null, scope: "India" | "Global"): { city: string | null; country: string } {
  if (!location) return { city: null, country: scope === "India" ? "India" : "Online" };
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (parts.length > 1 && regionOf(last)) return { city: parts.slice(0, -1).join(", ").slice(0, 120), country: last };
  if (regionOf(last)) return { city: null, country: last };
  return { city: location.slice(0, 120), country: scope === "India" ? "India" : "Worldwide" };
}
