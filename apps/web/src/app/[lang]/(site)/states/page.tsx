import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { TILES, type StateTile } from "@/funding/directory";
import { fmtDate } from "@/lib/format";
import { stateLabel } from "@/lib/labels";
import { pageMetadata } from "@/seo";
import { RANKING, STATE_TIER, TIER_SHADE, TIERS } from "@/states/ranking";
import { CHECKED_ON, GATHERED_ON, SUPPORT } from "@/support/directory";
import { SupportList } from "./support-list";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params): Promise<Lang> => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return pageMetadata("states", await langOf(params));
}

/** Every state and UT on the tile map, each linking to its page, tinted by DPIIT's latest ranking. */
export default async function StatesPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const d = t.states;
  const tiles = Object.entries(TILES) as [StateTile, readonly [number, number]][];
  const names = tiles.map(([c]) => c).sort((a, b) => stateLabel(a, lang).localeCompare(stateLabel(b, lang), lang));
  const en = lang === "en" ? undefined : "en";

  return (
    <div>
      <section className="bg-neel-900 text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
            <p className="mt-4 max-w-[58ch] text-lg text-neel-100">{d.lead}</p>
          </div>
          <div>
            <nav aria-label={d.mapLabel} dir="ltr" className="mx-auto grid max-w-[34rem] grid-cols-10 gap-1.5">
              {tiles.map(([c, [x, y]]) => {
                const tier = STATE_TIER[c];
                const name = stateLabel(c, lang);
                const style = { gridColumn: x + 1, gridRow: y + 1, "--v": tier ? String(TIER_SHADE[tier]) : "0" } as CSSProperties;
                return (
                  <Link
                    key={c}
                    href={`/states/${c.toLowerCase()}`}
                    title={name}
                    style={style}
                    className={`funding-tile grid aspect-square place-items-center rounded-md font-display text-[0.8rem] font-bold leading-none no-underline ${tier ? "has" : ""}`}
                  >
                    <span lang="en" aria-hidden="true">{c}</span>
                    <span className="sr-only">{name}</span>
                  </Link>
                );
              })}
            </nav>
            <ul className="mx-auto mt-3 flex max-w-[34rem] flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-neel-100">
              {TIERS.map((tier) => (
                <li key={tier} className="flex items-center gap-2">
                  <span aria-hidden="true" className="funding-tile has inline-block h-3 w-3 rounded-sm" style={{ "--v": String(TIER_SHADE[tier]) } as CSSProperties} />
                  {d.tiers[tier]}
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-1 max-w-[34rem] text-[0.8rem] text-neel-100/80">
              <a href={RANKING.source} className="underline">{d.rankSource}</a>: DPIIT, {fmtDate(RANKING.announced, true, lang)}. {d.rankNote}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <section aria-labelledby="list-h" className="mt-10">
          <h2 id="list-h" className="display text-4xl">{d.listTitle}</h2>
          <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {names.map((c) => (
              <li key={c}>
                <Link href={`/states/${c.toLowerCase()}`} className="underline">{stateLabel(c, lang)}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="national-h" className="mt-12">
          <h2 id="national-h" className="display text-4xl">{d.nationalTitle}</h2>
          <p className="mt-2 rounded-md bg-marigold-50 px-4 py-2.5 text-[0.95rem] text-neel-900">{f(d.unchecked, { date: fmtDate(CHECKED_ON ?? GATHERED_ON, true, lang) })}</p>
          <SupportList entries={SUPPORT.filter((s) => s.geo === "IN")} lang={lang} en={en} />
        </section>
      </div>
    </div>
  );
}
