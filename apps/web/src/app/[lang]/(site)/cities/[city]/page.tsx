import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange, userTextLang } from "@/lib/format";
import { stateLabel } from "@/lib/labels";
import type { EventItem, StartupPublic } from "@/lib/types";
import { CITY_INFO, cityById, type CityInfo } from "@/cities/directory";
import { FUNDING, fundingId } from "@/funding/directory";
import { CHECKED_ON, GATHERED_ON, SUPPORT } from "@/support/directory";
import { describe, keywordList, seoMetadata, seoTitle } from "@/seo";
import { SupportList } from "../../states/support-list";

type Params = Promise<{ lang: string; city: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return CITY_INFO.map((c) => ({ city: c.id }));
}

async function resolve(params: Params): Promise<{ lang: Lang; c: CityInfo } | null> {
  const p = await params;
  const c = cityById(p.city);
  return c ? { lang: isLang(p.lang) ? p.lang : "en", c } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const d = getDict(r.lang).cities;
  const city = r.c.names[r.lang];
  const state = stateLabel(r.c.state, r.lang);
  const title = f(d.pageTitle, { city });
  return seoMetadata(`/cities/${r.c.id}`, r.lang, {
    focus: title,
    title: seoTitle(title, d.seoTail),
    description: describe(f(d.seoDesc, { city, state }), getDict(r.lang).states.seoClosing),
    excerpt: f(d.pageLead, { city }),
    keywords: keywordList([title, city, f(d.supportTitle, { city }), f(d.eventsTitle, { city }), f(d.fundingTitle, { city }), state], [d.title, "Startup India", "Foundura"]),
  });
}

/** One city: support organisations and funders based there, upcoming events, and startups from there. */
export default async function CityPage({ params }: { params: Params }) {
  const r = await resolve(params);
  if (!r) notFound();
  const { lang, c } = r;
  const t = getDict(lang);
  const d = t.cities;
  const city = c.names[lang];
  const state = stateLabel(c.state, lang);
  const en = lang === "en" ? undefined : "en";
  const [events, startups] = await Promise.all([
    apiOr<EventItem[]>("/events", []),
    // Not cached: a founder who switches their profile off must disappear straight away.
    apiOr<StartupPublic[]>(`/startups?city=${c.id}`, [], 0),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.city && c.match.test(e.city) && (e.startDate ?? e.deadline ?? "") >= today)
    .sort((a, b) => (a.startDate ?? a.deadline ?? "").localeCompare(b.startDate ?? b.deadline ?? ""))
    .slice(0, 8);
  const support = SUPPORT.filter((e) => c.match.test(e.base));
  const funding = FUNDING.filter((e) => c.match.test(e.base));

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <p className="text-[0.95rem]">
        <Link href="/cities" className="underline">{d.title}</Link>
      </p>
      <h1 className="display mt-2 text-6xl md:text-7xl">{f(d.pageTitle, { city })}</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{f(d.pageLead, { city })}</p>
      <p className="mt-5 flex flex-wrap gap-3">
        <Link href={`/states/${c.state.toLowerCase()}`} className="inline-block rounded-md bg-marigold px-5 py-3 font-semibold text-neel-950 no-underline hover:brightness-95">{f(d.stateLink, { state })}</Link>
      </p>

      <section aria-labelledby="ev-h" className="mt-12">
        <h2 id="ev-h" className="display text-4xl">{f(d.eventsTitle, { city })}</h2>
        {upcoming.length ? (
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {upcoming.map((e) => (
              <li key={e.slug} className="grid grid-cols-[9rem_1fr] gap-3 py-3">
                <span className="font-semibold text-neel-700">{e.startDate ? fmtRange(e.startDate, e.endDate, lang) : fmtDate(e.deadline, true, lang)}</span>
                <span lang={en}>
                  <span className="block font-semibold leading-snug">{e.name}</span>
                  <span className="block text-[0.9rem] text-slate">{[e.city, e.type].filter(Boolean).join(", ")}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-neel-700">{f(d.eventsNone, { city })}</p>
        )}
        <p className="mt-4"><Link href="/events" className="underline">{d.eventsAll}</Link></p>
      </section>

      <section aria-labelledby="support-h" className="mt-12">
        <h2 id="support-h" className="display text-4xl">{f(d.supportTitle, { city })}</h2>
        <p className="mt-2 rounded-md bg-marigold-50 px-4 py-2.5 text-[0.95rem] text-neel-900">{f(t.states.unchecked, { date: fmtDate(CHECKED_ON ?? GATHERED_ON, true, lang) })}</p>
        {support.length ? <SupportList entries={support} lang={lang} en={en} /> : <p className="mt-3 text-neel-700">{f(d.supportNone, { city, state })}</p>}
      </section>

      <section aria-labelledby="funding-h" className="mt-12">
        <h2 id="funding-h" className="display text-4xl">{f(d.fundingTitle, { city })}</h2>
        {funding.length ? (
          <ul className="mt-4 space-y-3">
            {funding.map((e) => (
              <li key={e.name} className="border-t border-rule pt-3">
                <p className="text-[0.85rem] font-semibold text-slate">{t.funding.kinds[e.kind]}</p>
                <Link href={`/funding#${fundingId(e)}`} className="text-lg font-semibold underline" lang={en}>{e.name}</Link>
                <p className="mt-1 text-neel-700" lang={en}>{e.offer}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-neel-700">{f(d.fundingNone, { city })}</p>
        )}
      </section>

      <section aria-labelledby="startups-h" className="mt-12">
        <h2 id="startups-h" className="display text-4xl">{f(d.startupsTitle, { city })}</h2>
        {startups.length ? (
          <ul className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {startups.slice(0, 12).map((s) => (
              <li key={s.slug} className="border-t border-rule pt-3">
                <Link href={`/startups/${s.slug}`} lang={userTextLang(s.name, lang)} className="font-semibold underline">{s.name}</Link>
                {s.oneLiner && <p lang={userTextLang(s.oneLiner, lang)} className="mt-1 text-neel-700">{s.oneLiner}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-neel-700">{f(d.startupsNone, { city })}</p>
        )}
        <p className="mt-4"><Link href="/dashboard" className="underline">{t.states.addYours}</Link></p>
      </section>
    </div>
  );
}
