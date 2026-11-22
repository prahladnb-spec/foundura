import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Startup events in India and worldwide",
  description: "Upcoming startup expos, summits, pitch competitions and deadlines in India and around the world.",
};

const STATUS_NOTE: Record<string, string> = {
  "Listing only": "Dates from event listings; organiser not confirmed yet",
  "To verify": "Dates being verified with the organiser",
  Cancelled: "Cancelled",
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const { scope } = await searchParams;
  const q = scope === "India" || scope === "Global" ? `?scope=${scope}` : "";
  const events = await apiOr<EventItem[]>(`/events${q}`, []);
  const tab = (label: string, value?: string) => {
    const active = (scope ?? "") === (value ?? "");
    return (
      <Link
        href={value ? `/events?scope=${value}` : "/events"}
        aria-current={active ? "page" : undefined}
        className={`rounded-full border px-4 py-1.5 no-underline ${active ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white text-neel-900"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      {/* Only confirmed events with dates go to search engines; "to verify" ones stay on the page only. */}
      <JsonLd
        data={events
          .filter((e) => e.status === "Confirmed" && e.startDate)
          .map((e) => ({
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.name,
            startDate: e.startDate,
            ...(e.endDate ? { endDate: e.endDate } : {}),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: e.city ?? e.country, address: { "@type": "PostalAddress", addressLocality: e.city ?? undefined, addressCountry: e.country } },
            ...(e.sourceUrl ? { url: e.sourceUrl } : {}),
            ...(e.bestFor ? { description: `Best for ${e.bestFor.toLowerCase()}` } : {}),
          }))}
      />
      <h1 className="display text-6xl md:text-7xl">Events</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
        Expos, summits, pitch days and application deadlines. Updated every week.
      </p>
      <div className="mt-6 flex gap-2">{tab("All")}{tab("India", "India")}{tab("Worldwide", "Global")}</div>
      <ul className="mt-6 border-t-2 border-neel-900">
        {events.map((e) => (
          <li key={e.slug} className="grid gap-2 border-b border-rule py-5 md:grid-cols-[10rem_1fr]">
            <div className="font-semibold text-neel-700">
              {e.startDate ? fmtRange(e.startDate, e.endDate) : "Date to be announced"}
              {e.deadline && <span className="block text-[0.9rem] text-marigold-ink">Apply by {fmtDate(e.deadline)}</span>}
            </div>
            <div>
              <p className="text-lg font-semibold leading-snug">{e.name}</p>
              <p className="text-[0.93rem] text-slate">{[e.city, e.country !== "India" ? e.country : null, e.type].filter(Boolean).join(", ")}</p>
              {e.bestFor && <p className="mt-1">Best for: {e.bestFor}</p>}
              {e.notes && <p className="text-neel-700">{e.notes}</p>}
              <p className="mt-1 text-[0.88rem] text-slate">
                {STATUS_NOTE[e.status] ? `${STATUS_NOTE[e.status]}. ` : ""}
                {e.sourceUrl && (
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Source: {e.sourceName}</a>
                )}
              </p>
            </div>
          </li>
        ))}
        {events.length === 0 && <li className="py-6 text-slate">No upcoming events in this view yet.</li>}
      </ul>
    </div>
  );
}
