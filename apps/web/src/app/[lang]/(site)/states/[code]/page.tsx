import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { FUNDING, fundingId, isState, type StateTile } from "@/funding/directory";
import { apiOr } from "@/lib/api";
import { fmtDate, userTextLang } from "@/lib/format";
import { stateLabel } from "@/lib/labels";
import type { Scheme, StartupPublic } from "@/lib/types";
import { describe, keywordList, seoMetadata, seoTitle } from "@/seo";
import { RANKING, STATE_TIER } from "@/states/ranking";
import { CHECKED_ON, GATHERED_ON, SUPPORT } from "@/support/directory";
import { SupportList } from "../support-list";

type Params = Promise<{ lang: string; code: string }>;

async function resolve(params: Params): Promise<{ lang: Lang; code: StateTile } | null> {
  const p = await params;
  const code = p.code.toUpperCase();
  if (p.code !== p.code.toLowerCase() || !isState(code)) return null;
  return { lang: isLang(p.lang) ? p.lang : "en", code };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const d = getDict(r.lang).states;
  const state = stateLabel(r.code, r.lang);
  const title = f(d.pageTitle, { state });
  return seoMetadata(`/states/${r.code.toLowerCase()}`, r.lang, {
    focus: title,
    title: seoTitle(title, d.seoTail),
    description: describe(f(d.seoDesc, { state }), d.seoClosing),
    excerpt: f(d.pageLead, { state }),
    keywords: keywordList([title, state, `${d.schemesTitle}: ${state}`, `${d.fundingTitle}: ${state}`, `${d.supportTitle}: ${state}`], [d.title, "DPIIT", "Startup India", "Foundura"]),
  });
}

/** One state or UT: its DPIIT ranking, state schemes, funding, incubators and startups from there. */
export default async function StatePage({ params }: { params: Params }) {
  const r = await resolve(params);
  if (!r) notFound();
  const { lang, code } = r;
  const t = getDict(lang);
  const d = t.states;
  const state = stateLabel(code, lang);
  const en = lang === "en" ? undefined : "en";
  const tier = STATE_TIER[code];

  const [schemes, startups] = await Promise.all([
    apiOr<Scheme[]>(`/schemes?lang=${lang === "hi" ? "hi" : "en"}`, []),
    // Not cached: a founder who switches their profile off must disappear straight away.
    apiOr<StartupPublic[]>(`/startups?state=${code}`, [], 0),
  ]);
  const stateSchemes = schemes.filter((s) => s.level === "state" && s.state === code && s.status !== "closed");
  const central = schemes.filter((s) => s.level === "national" && s.status !== "closed").length;
  const funding = FUNDING.filter((e) => e.geo === code);
  const support = SUPPORT.filter((e) => e.geo === code);
  const [evA, evB] = d.eventsLine.split("{link}");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <p className="text-[0.95rem]">
        <Link href="/states" className="underline">{d.title}</Link>
      </p>
      <h1 className="display mt-2 text-6xl md:text-7xl">{f(d.pageTitle, { state })}</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{f(d.pageLead, { state })}</p>
      <p className="mt-5">
        <Link href={`/scan?state=${code}`} className="inline-block rounded-md bg-marigold px-5 py-3 font-semibold text-neel-950 no-underline hover:brightness-95">{d.scan}</Link>
      </p>

      <section aria-labelledby="rank-h" className="mt-10 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
        <h2 id="rank-h" className="display text-3xl">{d.rankTitle}</h2>
        <p className="mt-3 text-lg">
          {tier
            ? f(d.rank, { tier: d.tiers[tier], edition: RANKING.edition, date: fmtDate(RANKING.announced, true, lang) })
            : f(d.rankNone, { state, edition: RANKING.edition })}
        </p>
        <p className="mt-2 text-neel-100">
          {d.rankNote} <a href={RANKING.source} className="underline">{d.rankSource}</a>
        </p>
      </section>

      <section aria-labelledby="schemes-h" className="mt-12">
        <h2 id="schemes-h" className="display text-4xl">{d.schemesTitle}</h2>
        {stateSchemes.length ? (
          <ul className="mt-4 space-y-3">
            {stateSchemes.map((s) => (
              <li key={s.slug} className="border-t border-rule pt-3">
                <Link href={`/schemes/${s.slug}`} className="text-lg font-semibold underline" lang={s.contentLang === lang ? undefined : s.contentLang}>{s.name}</Link>
                <p className="mt-1 text-neel-700" lang={s.contentLang === lang ? undefined : s.contentLang}>{s.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-neel-700">{f(d.schemesNone, { state })}</p>
        )}
        <p className="mt-4">
          <Link href="/schemes" className="underline">{f(d.schemesCentral, { n: central })}</Link>
        </p>
      </section>

      <section aria-labelledby="funding-h" className="mt-12">
        <h2 id="funding-h" className="display text-4xl">{d.fundingTitle}</h2>
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
          <p className="mt-3 text-neel-700">{f(d.fundingNone, { state })}</p>
        )}
        <p className="mt-4"><Link href="/funding" className="underline">{d.fundingAll}</Link></p>
      </section>

      <section aria-labelledby="support-h" className="mt-12">
        <h2 id="support-h" className="display text-4xl">{d.supportTitle}</h2>
        <p className="mt-2 rounded-md bg-marigold-50 px-4 py-2.5 text-[0.95rem] text-neel-900">{f(d.unchecked, { date: fmtDate(CHECKED_ON ?? GATHERED_ON, true, lang) })}</p>
        {support.length ? <SupportList entries={support} lang={lang} en={en} /> : <p className="mt-3 text-neel-700">{f(d.supportNone, { state })}</p>}
      </section>

      <section aria-labelledby="startups-h" className="mt-12">
        <h2 id="startups-h" className="display text-4xl">{f(d.startupsTitle, { state })}</h2>
        {startups.length ? (
          <ul className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {startups.slice(0, 8).map((s) => (
              <li key={s.slug} className="border-t border-rule pt-3">
                <Link href={`/startups/${s.slug}`} lang={userTextLang(s.name, lang)} className="font-semibold underline">{s.name}</Link>
                {s.oneLiner && <p lang={userTextLang(s.oneLiner, lang)} className="mt-1 text-neel-700">{s.oneLiner}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-neel-700">{f(d.startupsNone, { state })}</p>
        )}
        <p className="mt-4 flex flex-wrap gap-5">
          {startups.length > 0 && <Link href={`/startups?state=${code}`} className="underline">{d.startupsAll}</Link>}
          <Link href="/dashboard" className="underline">{d.addYours}</Link>
        </p>
      </section>

      <p className="mt-12 text-neel-700">
        {evA}
        <Link href="/events" className="underline">{d.eventsLink}</Link>
        {evB}
      </p>
    </div>
  );
}
