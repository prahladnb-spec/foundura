import { pageMetadata } from "@/seo";
import { Monogram } from "@/components/icons";
import { Art, PageIntro } from "@/components/art";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { INDIAN_STATES, LOOKING_FOR, SECTORS, STAGES } from "@foundura/shared";
import { apiOr } from "@/lib/api";
import { getDict, lab, plural } from "@/i18n";
import { isLang } from "@/i18n/config";
import { userTextLang } from "@/lib/format";
import { lookingForLabel, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import type { StartupPublic } from "@/lib/types";

type Params = Promise<{ lang: string }>;
type Search = Promise<{ sector?: string; stage?: string; state?: string; lookingFor?: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("startups", isLang(lang) ? lang : "en");
}

export default async function StartupsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const d = t.startups;
  const filters = await searchParams;
  const q = new URLSearchParams();
  // Only known values go to the API; anything else is ignored rather than shown as an error.
  const known: Record<string, readonly { value: string }[]> = { sector: SECTORS, stage: STAGES, state: INDIAN_STATES, lookingFor: LOOKING_FOR };
  for (const [k, list] of Object.entries(known)) {
    const v = filters[k as keyof typeof filters];
    if (v && list.some((x) => x.value === v)) q.set(k, v);
  }
  // Not cached: a founder who switches their profile off must disappear straight away.
  const startups = await apiOr<StartupPublic[]>(`/startups${q.size ? `?${q}` : ""}`, [], 0);
  const [before, after] = d.emptyMore.split("{link}");
  const select = "rounded-md border border-rule bg-white px-3 py-2";

  const filter = (name: string, label: string, all: string, options: readonly { value: string }[], text: (v: string) => string) => (
    <label>
      <span className="mb-1 block text-[0.9rem] font-semibold">{label}</span>
      <select name={name} defaultValue={q.get(name) ?? ""} className={select}>
        <option value="">{all}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{text(o.value)}</option>)}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <PageIntro art="showcase">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      </PageIntro>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        {filter("sector", d.sector, d.allSectors, SECTORS, (v) => String(lab(t.labels.sector, v)))}
        {filter("stage", d.stage, d.allStages, STAGES, (v) => String(lab(t.labels.stage, v)))}
        {filter("state", d.state, d.allStates, INDIAN_STATES, (v) => String(lab(t.labels.state, v)))}
        {filter("lookingFor", d.lookingFor, d.anything, LOOKING_FOR, (v) => String(lab(t.labels.lookingFor, v)))}
        <button className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold">{d.filter}</button>
      </form>

      {startups.length > 0 && <p className="mt-6 text-slate">{plural(startups.length, d.count.one, d.count.other)}</p>}

      <ul className="mt-3 grid gap-x-8 border-t-2 border-neel-900 md:grid-cols-2">
        {startups.map((s) => (
          <li key={s.slug} className="flex gap-4 border-b border-rule py-5">
            <Monogram name={s.name} className="mt-0.5 h-12 w-12" />
            <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              <Link href={`/startups/${s.slug}`} lang={userTextLang(s.name, lang)} className="hover:underline">{s.name}</Link>
            </h2>
            {s.oneLiner && <p lang={userTextLang(s.oneLiner, lang)} className="mt-1 text-neel-700">{s.oneLiner}</p>}
            <p className="mt-2 text-[0.93rem] text-slate">
              {[s.sectors.map((x) => sectorLabel(x, lang)).join(", "), stageLabel(s.stage, lang), stateLabel(s.state, lang)].filter(Boolean).join("; ")}
            </p>
            {s.lookingFor.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1.5">
                <span className="sr-only">{d.lookingFor}: </span>
                {s.lookingFor.map((x) => (
                  <span key={x} className="rounded-full border border-marigold bg-marigold-50 px-2.5 py-0.5 text-[0.85rem] text-marigold-ink">
                    {lookingForLabel(x, lang)}
                  </span>
                ))}
              </p>
            )}
            </div>
          </li>
        ))}
        {startups.length === 0 && (
          <li className="py-8 text-center md:col-span-2">
            <Art name="empty" className="mx-auto mb-2 w-[220px]" />
            <p className="text-lg">{d.empty}</p>
            <p className="mt-1 text-slate">
              {before}
              <Link href="/signin" className="text-neel-500 underline">{d.listFree}</Link>
              {after}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
