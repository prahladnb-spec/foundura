import { apiOr } from "@/lib/api";
import { FEED_IDS, FEED_TITLES, type FeedId, feedPath } from "@/lib/feeds";
import type { ArticleSummary, EventItem, PolicyItem } from "@/lib/types";
import { roundId, roundsByDate } from "@/rounds/rounds";
import { SITE } from "@/seo";

// Lists come from the API through the same hourly cache the pages use.
export const dynamic = "force-dynamic";

type Entry = { id: string; title: string; link: string; updated: string; summary: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const iso = (d: string | null | undefined) => {
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? new Date(0).toISOString() : new Date(t).toISOString();
};

async function entries(id: FeedId): Promise<Entry[]> {
  switch (id) {
    case "policy": {
      const items = await apiOr<PolicyItem[]>("/policy", []);
      return items.map((p) => ({
        id: `policy-${p.slug}`,
        title: p.headline,
        link: `/policy#policy-${p.slug}`,
        updated: iso(p.date),
        summary: `${p.country}, ${p.instrument.toLowerCase()}. ${p.takeaway} Source: ${p.sourceName}.`,
      }));
    }
    case "guides": {
      const items = await apiOr<ArticleSummary[]>("/articles", []);
      return items.filter((a) => a.publishedAt).map((a) => ({ id: `guide-${a.slug}`, title: a.title, link: `/learn/${a.slug}`, updated: iso(a.publishedAt), summary: a.excerpt }));
    }
    case "events": {
      const items = await apiOr<EventItem[]>("/events", []);
      return items.map((e) => ({
        id: `event-${e.slug}`,
        title: e.name,
        link: `/events?view=list#event-${e.slug}`,
        updated: iso(e.startDate ?? e.deadline),
        summary: [e.startDate ? `Starts ${e.startDate.slice(0, 10)}` : e.deadline ? `Deadline ${e.deadline.slice(0, 10)}` : null, e.format, [e.city, e.country].filter(Boolean).join(", "), e.bestFor].filter(Boolean).join(". "),
      }));
    }
    case "rounds":
      return roundsByDate().map((r) => ({
        id: `round-${roundId(r)}`,
        title: `${r.company} raises ${r.amount}`,
        link: `/rounds#${roundId(r)}`,
        updated: iso(r.date),
        summary: `${r.what}. Investors: ${r.investors.join(", ")}. As reported by ${r.source.name}.`,
      }));
  }
}

/** Atom feeds at /feeds/<id>.xml (policy news, guides, events, funding rounds), newest first, 50 entries. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^([a-z]+)\.xml$/.exec(file);
  if (!m || !(FEED_IDS as readonly string[]).includes(m[1])) return new Response("Not found", { status: 404 });
  const id = m[1] as FeedId;
  const list = (await entries(id)).sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 50);
  const self = `${SITE}${feedPath(id)}`;
  const updated = list[0]?.updated ?? new Date(0).toISOString();
  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${esc(FEED_TITLES[id])}</title>
  <id>${esc(self)}</id>
  <link rel="self" type="application/atom+xml" href="${esc(self)}"/>
  <link rel="alternate" type="text/html" href="${esc(SITE)}/"/>
  <updated>${updated}</updated>
  <author><name>Foundura</name></author>
  <rights>CC BY 4.0</rights>
${list
  .map(
    (e) => `  <entry>
    <title>${esc(e.title)}</title>
    <id>${esc(`${SITE}/#${e.id}`)}</id>
    <link rel="alternate" type="text/html" href="${esc(SITE + e.link)}"/>
    <updated>${e.updated}</updated>
    <summary>${esc(e.summary)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>
`;
  return new Response(body, { headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, max-age=1800", "Access-Control-Allow-Origin": "*" } });
}
