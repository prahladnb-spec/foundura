import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { getDict, lab } from "@/i18n";
import { f, isLang, type Lang, MONTHS } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { sectorLabel, stateLabel } from "@/lib/labels";
import type { EventItem, Scheme, StartupPublic } from "@/lib/types";
import { FUNDING } from "@/funding/directory";
import { SUPPORT } from "@/support/directory";
import { PERKS } from "@/perks/directory";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("numbers", isLang(lang) ? lang : "en");
}

type Usage = { since: string; totals: Record<"scan_run" | "template_download" | "calendar_add" | "signup", number> };

const countBy = <T,>(list: T[], key: (x: T) => string[] | string | null) => {
  const m = new Map<string, number>();
  for (const x of list) for (const k of [key(x)].flat()) if (k) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

/** Foundura in numbers: totals from its own lists and anonymous daily counts. Never anything about a person. */
export default async function NumbersPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "en";
  const t = getDict(lang);
  const d = t.numbers;
  const [schemes, startups, events, usage] = await Promise.all([
    apiOr<Scheme[]>("/schemes?lang=en", [], 3600),
    apiOr<StartupPublic[]>("/startups", [], 3600),
    apiOr<EventItem[]>("/events", [], 3600),
    apiOr<Usage | null>("/stats/usage", null, 3600),
  ]);
  const nf = new Intl.NumberFormat(lang === "en" || lang === "hi" ? `${lang}-IN` : undefined);
  const n = (x: number) => nf.format(x);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => (e.startDate ?? e.deadline ?? "") >= today);
  const months = Array.from({ length: 6 }, (_, i) => {
    const dt = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + i, 1));
    return dt.toISOString().slice(0, 7);
  });
  const byMonth = months.map((m) => [m, upcoming.filter((e) => (e.startDate ?? e.deadline ?? "").startsWith(m)).length] as const);

  const figures: [number, string][] = [
    [schemes.length, d.schemes],
    [new Set(schemes.filter((s) => s.state).map((s) => s.state)).size, d.statesWithSchemes],
    [FUNDING.length, d.funders],
    [SUPPORT.length, d.support],
    [PERKS.length, d.perks],
    [startups.length, d.startups],
    [upcoming.length, d.events],
  ];

  const bars = (title: string, id: string, rows: (readonly [string, number])[], label: (k: string) => string) => {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return (
      <section aria-labelledby={id} className="rounded-xl border-2 border-neel-900 bg-white p-6">
        <h2 id={id} className="display text-2xl">{title}</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-slate">{d.none}</p>
        ) : (
          <table className="mt-3 w-full text-[0.95rem]">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-rule last:border-0">
                  <th scope="row" className="w-1/2 py-1.5 pe-3 text-start font-normal">{label(k)}</th>
                  <td className="py-1.5">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="inline-block h-2.5 rounded-sm bg-marigold" style={{ width: `${Math.max(4, (v / max) * 100)}%` }} />
                      <span className="tabular-nums">{n(v)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <PageIntro art="showcase">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      </PageIntro>

      <dl className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {figures.map(([v, label]) => (
          <div key={label} className="flex flex-col-reverse border-t-2 border-marigold pt-2">
            <dt className="text-[0.95rem] text-neel-700">{label}</dt>
            <dd className="font-display text-4xl font-extrabold leading-none">{n(v)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {bars(d.byCategory, "cat-h", countBy(schemes, (s) => s.category).slice(0, 8), (k) => String(lab(t.labels.category, k)))}
        {bars(d.bySector, "sector-h", countBy(startups, (s) => s.sectors).slice(0, 8), (k) => sectorLabel(k, lang))}
        {bars(d.byState, "state-h", countBy(startups, (s) => s.state).slice(0, 8), (k) => stateLabel(k, lang))}
        {bars(d.byMonth, "month-h", byMonth, (k) => `${MONTHS[lang][Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`)}
      </div>

      {usage && (
        <section aria-labelledby="use-h" className="mt-12 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
          <h2 id="use-h" className="display text-3xl">{d.usageTitle}</h2>
          <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(["scan_run", "template_download", "calendar_add", "signup"] as const).map((k) => (
              <div key={k} className="flex flex-col-reverse border-t-2 border-marigold pt-2">
                <dt className="text-[0.95rem] text-neel-100">{d.usage[k]}</dt>
                <dd className="font-display text-4xl font-extrabold leading-none">{n(usage.totals[k])}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[0.92rem] text-neel-100">{d.usageNote}</p>
        </section>
      )}

      <p className="mt-10 max-w-[65ch] text-neel-700">
        {d.dataA}
        <Link href="/data" className="text-neel-500 underline">{d.dataLink}</Link>
        {d.dataB}
      </p>
    </div>
  );
}
