import type { Metadata } from "next";
import { FeedLink } from "@/components/feed-link";
import Link from "@/components/locale-link";
import { SECTORS } from "@foundura/shared";
import { getDict, lab } from "@/i18n";
import { f, isLang, lp, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import { stateLabel } from "@/lib/labels";
import { pageMetadata } from "@/seo";
import { CHECKED_ON, GATHERED_ON, ROUND_TYPES, type Round, type RoundType, roundId, roundsByDate } from "@/rounds/rounds";

type Params = Promise<{ lang: string }>;
type Search = Promise<{ sector?: string; round?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("rounds", isLang(lang) ? lang : "en");
}

const select = "w-full rounded-md border border-rule bg-white px-3 py-2 text-[1rem]";

/** Funding rounds raised by Indian startups, as publicly reported, newest first, filtered by sector and round. */
export default async function RoundsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const p = await params;
  const sp = await searchParams;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const d = t.rounds;
  // Entries are written in English; other languages show them marked as English.
  const en = lang === "en" ? undefined : "en";

  const all = roundsByDate();
  const sectors = SECTORS.filter((s) => all.some((r) => r.sector === s.value));
  const sector = sectors.some((s) => s.value === sp.sector) ? sp.sector : undefined;
  const round = (ROUND_TYPES as readonly string[]).includes(sp.round ?? "") ? (sp.round as RoundType) : undefined;
  const shown = all.filter((r) => (!sector || r.sector === sector) && (!round || r.round === round));
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  // Corrections come by email, so the site stores nothing about whoever reports one.
  const reportHref = (r: Round) => `mailto:${support}?subject=${encodeURIComponent(`Funding rounds: ${r.company}`)}`;
  const missingHref = `mailto:${support}?subject=${encodeURIComponent("Funding rounds: a missing round")}`;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <FeedLink id="rounds" />
      <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>

      <form method="get" action={lp(lang, "/rounds")} className="mt-8 grid max-w-2xl items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label>
          <span className="mb-1 block text-[0.9rem] font-semibold">{d.sector}</span>
          <select name="sector" defaultValue={sector ?? ""} className={select}>
            <option value="">{d.all}</option>
            {sectors.map((s) => <option key={s.value} value={s.value}>{lab(t.labels.sector, s.value)}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[0.9rem] font-semibold">{d.round}</span>
          <select name="round" defaultValue={round ?? ""} className={select}>
            <option value="">{d.all}</option>
            {ROUND_TYPES.map((r) => <option key={r} value={r}>{d.types[r]}</option>)}
          </select>
        </label>
        <button className="rounded-md border-2 border-neel-900 px-4 py-2 font-semibold">{d.show}</button>
      </form>

      <p className="mt-6 font-semibold" aria-live="polite">{f(d.count, { n: shown.length })}</p>
      <ol className="mt-3 border-t-2 border-neel-900">
        {shown.map((r) => (
          <li key={roundId(r)} id={roundId(r)} className="grid gap-x-6 gap-y-1 border-b border-rule py-4 md:grid-cols-[8rem_minmax(0,1.4fr)_minmax(0,1fr)]">
            <span className="text-[0.95rem] text-slate">{fmtDate(r.date, true, lang)}</span>
            <span>
              <span lang={en} className="block font-display text-xl font-bold leading-tight">{r.company}</span>
              <span className="block text-[0.93rem] text-neel-700">
                <span lang={en}>{r.what}</span>, {lab(t.labels.sector, r.sector)}
                {r.state && <>, <span lang={en}>{r.city}</span> ({stateLabel(r.state, lang)})</>}
              </span>
              <a href={reportHref(r)} className="mt-1 inline-block text-[0.85rem] text-slate underline">
                {d.report}<span className="sr-only" lang={en}>: {r.company}</span>
              </a>
            </span>
            <span>
              <span className="block font-semibold">
                <span lang={en}>{r.amount}</span>, {d.types[r.round]}
              </span>
              <span className="block text-[0.93rem] text-neel-700">
                {d.investors}: <span lang={en}>{r.investors.join(", ")}</span>
              </span>
              <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="text-[0.9rem] text-neel-500 underline">
                {d.source.split("{name}")[0]}<span lang={en}>{r.source.name}</span>{d.source.split("{name}")[1]}
              </a>
            </span>
          </li>
        ))}
        {shown.length === 0 && <li className="py-4 text-slate">{d.empty}</li>}
      </ol>

      <p className="mt-6 max-w-[75ch] text-[0.93rem] text-slate">
        {CHECKED_ON ? null : <>{f(d.unchecked, { date: fmtDate(GATHERED_ON, true, lang) })} </>}
        <a href={missingHref} className="underline">{d.missing}</a>
      </p>
      <p className="mt-2 flex flex-wrap gap-x-5 text-[0.93rem]">
        <Link href="/funding" className="text-neel-500 underline">{t.chrome.footer.funding}</Link>
        <Link href="/data" className="text-neel-500 underline">{t.chrome.footer.data}</Link>
      </p>
    </div>
  );
}
