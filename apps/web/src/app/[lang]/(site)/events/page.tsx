import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { JsonLd } from "@/components/json-ld";
import { apiOr } from "@/lib/api";
import { f, getDict, lab } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate, fmtRange } from "@/lib/format";
import type { EventItem } from "@/lib/types";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getDict(await langOf(params));
  return { title: t.events.metaTitle, description: t.events.metaDescription };
}

export default async function EventsPage({ params, searchParams }: { params: Params; searchParams: Promise<{ scope?: string }> }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const ev = t.events;
  const cond = lang === "en" ? undefined : "en";
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
      <h1 className="display text-6xl md:text-7xl">{ev.title}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">{ev.lead}</p>
      {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      <div className="mt-6 flex gap-2">{tab(ev.all)}{tab(ev.india, "India")}{tab(ev.world, "Global")}</div>
      <ul className="mt-6 border-t-2 border-neel-900">
        {events.map((e) => (
          <li key={e.slug} className="grid gap-2 border-b border-rule py-5 md:grid-cols-[10rem_1fr]">
            <div className="font-semibold text-neel-700">
              {e.startDate ? fmtRange(e.startDate, e.endDate, lang) : ev.tba}
              {e.deadline && <span className="block text-[0.9rem] text-marigold-ink">{f(ev.applyBy, { date: fmtDate(e.deadline, true, lang) })}</span>}
            </div>
            <div>
              <p lang={cond} className="text-lg font-semibold leading-snug">{e.name}</p>
              <p lang={cond} className="text-[0.93rem] text-slate">{[e.city, e.country !== "India" ? e.country : null, e.type].filter(Boolean).join(", ")}</p>
              {e.bestFor && <p className="mt-1">{ev.bestFor.split("{v}")[0]}<span lang={cond}>{e.bestFor}</span>{ev.bestFor.split("{v}")[1]}</p>}
              {e.notes && <p lang={cond} className="text-neel-700">{e.notes}</p>}
              <p className="mt-1 text-[0.88rem] text-slate">
                {e.status in ev.status ? `${lab(ev.status, e.status)}${lang === "hi" ? "। " : ". "}` : ""}
                {e.sourceUrl && (
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{t.common.source.split("{name}")[0]}<span lang={cond}>{e.sourceName}</span></a>
                )}
              </p>
            </div>
          </li>
        ))}
        {events.length === 0 && <li className="py-6 text-slate">{ev.empty}</li>}
      </ul>
    </div>
  );
}
