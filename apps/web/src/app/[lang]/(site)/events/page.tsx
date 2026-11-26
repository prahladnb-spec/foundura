import { pageMetadata } from "@/seo";
import { PageIntro } from "@/components/art";
import type { Metadata } from "next";
import { EVENT_FORMATS, EVENT_KINDS, EVENT_REGIONS } from "@foundura/shared";
import { EventCard } from "@/components/event-card";
import { EventsCalendar } from "@/components/events-calendar";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/locale-link";
import { SubscribeBox } from "@/components/subscribe-box";
import { getDict, lab } from "@/i18n";
import { isLang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { feedPath, monthLabel, monthRange, parseMonth, shiftMonth } from "@/lib/calendar";
import type { EventItem } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

type Params = Promise<{ lang: string }>;
type Search = Promise<{ view?: string; month?: string; region?: string; format?: string; type?: string; scope?: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("events", isLang(lang) ? lang : "en");
}

export default async function EventsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const ev = t.events;
  const sp = await searchParams;
  const view = sp.view === "list" ? "list" : "calendar";
  // Old links used ?scope=India / ?scope=Global.
  const region = (EVENT_REGIONS as readonly string[]).includes(sp.region ?? "") ? sp.region : sp.scope === "India" ? "India" : undefined;
  const format = (EVENT_FORMATS as readonly string[]).includes(sp.format ?? "") ? sp.format : undefined;
  const kind = (EVENT_KINDS as readonly string[]).includes(sp.type ?? "") ? sp.type : undefined;
  const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
  let month = parseMonth(sp.month);

  const filters = new URLSearchParams();
  if (region) filters.set("region", region);
  if (format) filters.set("format", format);
  if (kind) filters.set("type", kind);
  const load = (m: string | null) => {
    const q = new URLSearchParams(filters);
    if (m) {
      const range = monthRange(m);
      q.set("from", range.from);
      q.set("to", range.to);
    }
    // Not cached for long: imported and edited events should show up the same day.
    return apiOr<EventItem[]>(`/events${q.size ? `?${q}` : ""}`, [], 300);
  };
  let events = await load(view === "calendar" ? month : null);
  // Late in a quiet month, open on the next one rather than an empty grid.
  if (view === "calendar" && !sp.month && events.length === 0) {
    month = shiftMonth(month, 1);
    events = await load(month);
  }

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams(filters);
    if (view === "list") p.set("view", "list");
    if (view === "calendar" && month !== today.slice(0, 7)) p.set("month", month);
    for (const [k, v] of Object.entries(over)) (v === undefined ? p.delete(k) : p.set(k, v));
    return `/events${p.size ? `?${p}` : ""}`;
  };
  const tab = (label: string, active: boolean, to: string) => (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-1.5 no-underline ${active ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white text-neel-900"}`}
    >
      {label}
    </Link>
  );
  const select = "rounded-md border border-rule bg-white px-3 py-2";

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
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
            eventAttendanceMode: `https://schema.org/${e.format === "Online" ? "Online" : e.format === "Hybrid" ? "Mixed" : "Offline"}EventAttendanceMode`,
            location:
              e.format === "Online"
                ? { "@type": "VirtualLocation", url: e.sourceUrl ?? `${SITE}/events` }
                : { "@type": "Place", name: e.city ?? e.country, address: { "@type": "PostalAddress", addressLocality: e.city ?? undefined, addressCountry: e.country } },
            ...(e.sourceUrl ? { url: e.sourceUrl } : {}),
            ...(e.bestFor ? { description: `Best for ${e.bestFor.toLowerCase()}` } : {}),
          }))}
      />
      <PageIntro art="events">
        <h1 className="display text-6xl md:text-7xl">{ev.title}</h1>
        <p className="mt-3 max-w-[64ch] text-lg text-neel-700">{ev.lead}</p>
        {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      </PageIntro>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <nav aria-label={ev.view} className="flex gap-2">
          {tab(ev.calendar, view === "calendar", href({ view: undefined }))}
          {tab(ev.list, view === "list", href({ view: "list", month: undefined }))}
        </nav>
        <form method="get" className="flex flex-wrap items-end gap-3">
          {view === "list" && <input type="hidden" name="view" value="list" />}
          {view === "calendar" && <input type="hidden" name="month" value={month} />}
          <label>
            <span className="mb-1 block text-[0.9rem] font-semibold">{ev.where}</span>
            <select name="region" defaultValue={region ?? ""} className={select}>
              <option value="">{ev.everywhere}</option>
              {EVENT_REGIONS.map((r) => <option key={r} value={r}>{lab(ev.regions, r)}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[0.9rem] font-semibold">{ev.format}</span>
            <select name="format" defaultValue={format ?? ""} className={select}>
              <option value="">{ev.anyFormat}</option>
              {EVENT_FORMATS.map((x) => <option key={x} value={x}>{lab(ev.formats, x)}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[0.9rem] font-semibold">{ev.kind}</span>
            <select name="type" defaultValue={kind ?? ""} className={select}>
              <option value="">{ev.anyKind}</option>
              {EVENT_KINDS.map((x) => <option key={x} value={x}>{lab(ev.kinds, x)}</option>)}
            </select>
          </label>
          <button className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold">{ev.filter}</button>
        </form>
      </div>

      {view === "calendar" ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="display text-4xl">{monthLabel(month, lang)}</h2>
            <nav aria-label={ev.calendar} className="flex items-center gap-2">
              <Link href={href({ month: shiftMonth(month, -1) })} className="rounded-md border border-rule bg-white px-3 py-1.5 no-underline" aria-label={ev.prevMonth}>
                <span aria-hidden="true" className="inline-block rtl:-scale-x-100">←</span>
              </Link>
              {month !== today.slice(0, 7) && (
                <Link href={href({ month: today.slice(0, 7) })} className="rounded-md border border-rule bg-white px-3 py-1.5 no-underline">{ev.today}</Link>
              )}
              <Link href={href({ month: shiftMonth(month, 1) })} className="rounded-md border border-rule bg-white px-3 py-1.5 no-underline" aria-label={ev.nextMonth}>
                <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
              </Link>
            </nav>
          </div>
          <EventsCalendar key={`${month}-${region}-${format}-${kind}`} month={month} events={events} today={today} site={SITE} />
        </div>
      ) : (
        <ul className="mt-6 border-t-2 border-neel-900">
          {events.map((e) => (
            <li key={e.slug} id={`event-${e.slug}`} className="scroll-mt-28 border-b border-rule py-5">
              <EventCard e={e} t={t} lang={lang} site={SITE} />
            </li>
          ))}
          {events.length === 0 && <li className="py-6 text-slate">{ev.empty}</li>}
        </ul>
      )}

      <SubscribeBox site={SITE} path={feedPath({ region, format, type: kind })} />
    </div>
  );
}
