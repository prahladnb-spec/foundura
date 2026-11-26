import { API_URL } from "@/lib/api";

/**
 * Calendar files on the site's own address, so people can subscribe:
 * /calendar/foundura-events.ics?region=Europe&format=Online&type=Challenge is the feed of upcoming events,
 * /calendar/<event-slug>.ics is one event.
 */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^([a-z0-9-]+)\.ics$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });
  const incoming = new URL(req.url).searchParams;
  const q = new URLSearchParams();
  for (const k of ["region", "format", "scope", "type"]) {
    const v = incoming.get(k);
    if (v) q.set(k, v);
  }
  const path = m[1] === "foundura-events" ? `/v1/events/calendar.ics${q.size ? `?${q}` : ""}` : `/v1/events/${m[1]}/ics`;
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) return new Response(res.status === 404 ? "Not found" : "Calendar unavailable", { status: res.status === 404 ? 404 : 502 });
  return new Response(await res.text(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${m[1] === "foundura-events" ? "inline" : "attachment"}; filename="${file}"`,
      "Cache-Control": "public, max-age=1800",
    },
  });
}
