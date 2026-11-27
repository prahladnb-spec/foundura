import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/locale-link";
import { FundingFilter } from "@/components/funding-filter";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import { stateLabel } from "@/lib/labels";
import { pageMetadata } from "@/seo";
import {
  CHECKED_ON,
  FUNDING,
  type FundingEntry,
  type FundingGeo,
  type FundingKind,
  fundingId,
  GATHERED_ON,
  isOpenNow,
  isState,
  REGIONS,
  TILES,
  type StateTile,
} from "@/funding/directory";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("funding", isLang(lang) ? lang : "en");
}

const KINDS: FundingKind[] = ["vc", "angel", "debt", "fund", "grant", "state", "accelerator"];
const STATUS_CLASS = { open: "text-leaf", rolling: "text-leaf", periodic: "text-marigold-ink", announced: "text-marigold-ink", closed: "text-slate" } as const;

export default async function FundingPage({ params }: { params: Params }) {
  const p = await params;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const d = t.funding;
  // Entries are written in English; other languages show them marked as English.
  const en = lang === "en" ? undefined : "en";

  const count = new Map<FundingGeo, number>();
  for (const e of FUNDING) count.set(e.geo, (count.get(e.geo) ?? 0) + 1);
  const tiles = Object.entries(TILES) as [StateTile, readonly [number, number]][];
  const most = Math.max(...tiles.map(([c]) => count.get(c) ?? 0));
  const covered = tiles.filter(([c]) => count.get(c)).length;
  const geoName = (g: FundingGeo) => (isState(g) ? stateLabel(g, lang) : d.regions[g]);
  const states = tiles.map(([c]) => c).filter((c) => count.get(c)).sort((a, b) => geoName(a).localeCompare(geoName(b), lang));
  const order: FundingGeo[] = ["IN", ...states, ...REGIONS.filter((r) => r !== "IN")];
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  // Corrections come by email, so the site stores nothing about whoever reports one.
  const reportHref = (e: FundingEntry) => `mailto:${support}?subject=${encodeURIComponent(`Funding directory: ${e.name}`)}`;
  const gaps = tiles.map(([c]) => c).filter((c) => !count.get(c)).map(geoName).sort((a, b) => a.localeCompare(b, lang));

  const [polA, polB] = d.policies.split("{link}");
  const [proA, proB] = d.profiles.split("{link}");
  const btn = "min-h-11 rounded-lg border px-3 text-[0.95rem] font-semibold aria-pressed:border-neel-900 aria-pressed:bg-neel-900 aria-pressed:text-paper";

  const row = (e: FundingEntry) => (
    <tr key={e.name} id={fundingId(e)} data-entry="" data-geo={e.geo} data-kind={e.kind} data-status={e.status} className="scroll-mt-24 border-b border-rule align-top target:bg-marigold-50 max-md:grid max-md:gap-1 max-md:py-3">
      <td className="py-3 pe-4 max-md:py-0">
        <span lang={en} className="block">
          {e.url ? (
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-display text-lg font-bold leading-tight text-neel-900 underline decoration-marigold decoration-2 underline-offset-4">{e.name}</a>
          ) : (
            <span className="font-display text-lg font-bold leading-tight">{e.name}</span>
          )}
          <span className="mt-0.5 block text-[0.9rem] text-slate">{e.base}</span>
        </span>
        <a href={reportHref(e)} className="mt-1 me-4 inline-block text-[0.85rem] text-slate underline">
          {d.report}
          <span className="sr-only" lang={en}>: {e.name}</span>
        </a>
        {e.scheme && (
          <Link href={`/schemes/${e.scheme}`} className="mt-1 inline-block text-[0.9rem] text-neel-500 underline">{d.schemeLink}</Link>
        )}
      </td>
      <td className="whitespace-nowrap py-3 pe-4 text-[0.95rem] max-md:py-0">
        <span className="md:hidden text-slate">{d.cols.type}: </span>{d.kinds[e.kind]}
      </td>
      <td lang={en} className="py-3 pe-4 text-[0.95rem] max-md:py-0">
        {e.stage}
        <span className="block text-slate">{e.focus}</span>
      </td>
      <td lang={en} className="py-3 pe-4 text-[0.95rem] max-md:py-0">{e.offer}</td>
      <td className={`whitespace-nowrap py-3 text-[0.95rem] font-semibold max-md:py-0 ${STATUS_CLASS[e.status]}`}>{d.statuses[e.status]}</td>
    </tr>
  );

  return (
    <div id="funding">
      <section className="bg-neel-900 text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:py-14">
          <div>
            <h1 className="display text-5xl md:text-6xl">{d.title}</h1>
            <p className="mt-4 max-w-[52ch] text-lg text-neel-100">{d.lead}</p>
            <dl className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                [FUNDING.length, d.figEntries],
                [covered, d.figStates],
                [FUNDING.filter(isOpenNow).length, d.figOpen],
              ].map(([n, label]) => (
                <div key={String(label)} className="flex flex-row-reverse items-baseline justify-end gap-3 border-t-2 border-marigold pt-2 sm:flex-col-reverse sm:items-start sm:gap-1">
                  <dt className="text-[0.9rem] text-neel-100">{label}</dt>
                  <dd className="font-display text-4xl font-extrabold leading-none">{n}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-8 font-display text-lg font-bold">{d.beyond}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button key={r} type="button" data-geo-btn={r} aria-pressed="false" className="min-h-11 rounded-full border border-neel-500 px-4 font-semibold aria-pressed:border-marigold aria-pressed:bg-marigold aria-pressed:text-neel-950">
                  {d.regions[r]} <span className="font-normal opacity-80">{count.get(r) ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div role="group" dir="ltr" aria-label={d.mapLabel} className="mx-auto grid max-w-[34rem] grid-cols-10 gap-1.5">
              {tiles.map(([c, [x, y]]) => {
                const n = count.get(c) ?? 0;
                const name = stateLabel(c, lang);
                const style = { gridColumn: x + 1, gridRow: y + 1, "--v": n ? (0.4 + (0.6 * n) / most).toFixed(2) : "0" } as CSSProperties;
                return (
                  <button
                    key={c}
                    type="button"
                    data-geo-btn={c}
                    aria-pressed="false"
                    disabled={!n}
                    title={name}
                    style={style}
                    className={`funding-tile aspect-square rounded-md font-display text-[0.8rem] font-bold leading-none ${n ? "has" : ""}`}
                  >
                    <span lang="en">{c}</span>
                    {n > 0 && <span className="block text-[0.7rem] font-normal">{n}</span>}
                    <span className="sr-only">{n ? f(d.tile, { state: name, n }) : f(d.tileEmpty, { state: name })}</span>
                  </button>
                );
              })}
            </div>
            <p className="mx-auto mt-3 flex max-w-[34rem] flex-wrap gap-4 text-[0.9rem] text-neel-100">
              <span className="flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm bg-marigold" />{d.keyListed}</span>
              <span className="flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm border border-dashed border-neel-100" />{d.keyEmpty}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-6">
        <p className="mb-3 text-neel-700">
          {t.basics.fundingLine.split("{link}")[0]}
          <Link href="/basics" className="font-semibold text-neel-500 underline">{t.basics.fundingLink}</Link>
          {t.basics.fundingLine.split("{link}")[1]}
        </p>
        <p className="rounded-md bg-marigold-50 px-4 py-2.5 text-[0.95rem] text-neel-900">
          {f(CHECKED_ON ? d.checked : d.unchecked, { date: fmtDate(CHECKED_ON ?? GATHERED_ON, true, lang) })} {d.orgsOnly} {d.inEnglish}
        </p>

        <div id="funding-controls" hidden role="search" className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3 border-b border-rule pb-5">
          <div>
            <label htmlFor="funding-q" className="mb-1 block text-[0.9rem] text-slate">{d.search}</label>
            <input id="funding-q" type="search" placeholder={d.searchHint} autoComplete="off" className="h-11 w-[min(20rem,80vw)] rounded-lg border border-rule bg-white px-3 text-base" />
          </div>
          <div>
            <p id="funding-type" className="mb-1 text-[0.9rem] text-slate">{d.type}</p>
            <div role="group" aria-labelledby="funding-type" className="flex flex-wrap gap-1.5">
              <button type="button" data-kind-btn="" aria-pressed="true" className={`${btn} border-rule bg-white`}>{d.all}</button>
              {KINDS.map((k) => (
                <button key={k} type="button" data-kind-btn={k} aria-pressed="false" className={`${btn} border-rule bg-white`}>{d.kinds[k]}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="funding-status" className="mb-1 block text-[0.9rem] text-slate">{d.status}</label>
            <select id="funding-status" className="h-11 rounded-lg border border-rule bg-white px-3 text-base">
              <option value="">{d.anyStatus}</option>
              <option value="now">{d.statusNow}</option>
              <option value="periodic">{d.statusPeriodic}</option>
              <option value="closed">{d.statusClosed}</option>
            </select>
          </div>
          <button id="funding-clear" type="button" className="min-h-11 font-semibold text-neel-500 underline">{d.clear}</button>
        </div>
        <p id="funding-count" aria-live="polite" className="mt-4 scroll-mt-24 text-slate" />
        <p id="funding-empty" hidden className="py-8 text-slate">{d.empty}</p>

        {order.filter((g) => count.get(g)).map((g) => {
          const items = FUNDING.filter((e) => e.geo === g);
          return (
            <section key={g} data-group={g} aria-labelledby={`g-${g}`} className="mt-10">
              <h2 id={`g-${g}`} className="display flex flex-wrap items-baseline gap-3 border-b-2 border-neel-900 pb-1 text-3xl">
                {geoName(g)}
                <span className="font-body text-base font-normal text-slate">{f(d.listed, { n: items.length })}</span>
              </h2>
              <table className="mt-2 w-full border-collapse text-start">
                <thead className="max-md:sr-only">
                  <tr className="border-b border-rule text-start text-[0.9rem] text-slate">
                    <th scope="col" className="w-[24%] py-2 pe-4 text-start font-semibold">{d.cols.name}</th>
                    <th scope="col" className="w-[11%] py-2 pe-4 text-start font-semibold">{d.cols.type}</th>
                    <th scope="col" className="w-[19%] py-2 pe-4 text-start font-semibold">{d.cols.stage}</th>
                    <th scope="col" className="py-2 pe-4 text-start font-semibold">{d.cols.offer}</th>
                    <th scope="col" className="w-[12%] py-2 text-start font-semibold">{d.cols.status}</th>
                  </tr>
                </thead>
                <tbody>{items.map(row)}</tbody>
              </table>
            </section>
          );
        })}

        <section aria-labelledby="gaps-h" className="mt-12 rounded-xl bg-slate-50 p-6">
          <h2 id="gaps-h" className="display text-2xl">{gaps.length ? d.gapsTitle : d.moreTitle}</h2>
          {gaps.length > 0 && <p className="mt-2">{f(d.gaps, { list: gaps.join(", ") })}</p>}
          <p className="mt-2">
            {polA}
            <a href="https://www.startupindia.gov.in/content/sih/en/state-startup-policies.html" target="_blank" rel="noopener noreferrer" className="text-neel-500 underline">{d.policiesLink}</a>
            {polB}
          </p>
          <p className="mt-2">
            {proA}
            <Link href="/investors" className="text-neel-500 underline">{d.profilesLink}</Link>
            {proB}
          </p>
          <p className="mt-2">
            <Link href="/rounds" className="text-neel-500 underline">{t.rounds.title}</Link>: {t.rounds.lead}
          </p>
        </section>
      </div>
      <FundingFilter showing={d.showing} showingAll={d.showingAll} />
    </div>
  );
}
