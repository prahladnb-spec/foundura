import type { Metadata } from "next";
import { PageIntro } from "@/components/art";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { DATASET_IDS, LICENCE, loadDataset } from "@/data/datasets";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("data", isLang(lang) ? lang : "en");
}

/** Open data: Foundura's public lists to download, with what each holds and how fresh it is. */
export default async function DataPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "en";
  const d = getDict(lang).data;
  const sets = await Promise.all(DATASET_IDS.map(async (id) => ({ id, ...(await loadDataset(id)) })));
  const [licA, licB] = d.licence.split("{link}");
  const n = new Intl.NumberFormat(lang === "en" ? "en-IN" : undefined);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="documents">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
        <p className="mt-3 max-w-[62ch] text-neel-700">
          {licA}
          <a href={LICENCE.url} rel="license noopener noreferrer" target="_blank" className="text-neel-500 underline">{LICENCE.name}</a>
          {licB}
        </p>
      </PageIntro>

      <ul className="mt-10 border-t-2 border-neel-900">
        {sets.map((s) => (
          <li key={s.id} id={`data-${s.id}`} className="grid gap-3 border-b border-rule py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold">{d.sets[s.id].t}</h2>
              <p className="mt-1 max-w-[62ch] text-neel-700">{d.sets[s.id].d}</p>
              <p className="mt-1 text-[0.9rem] text-slate">
                {f(d.rows, { n: n.format(s.rows.length) })}, {f(s.checked ? d.asOf : d.gathered, { date: fmtDate(s.asOf, true, lang) })}
              </p>
            </div>
            <p className="flex gap-2">
              <a href={`/data/${s.id}.csv`} download className="rounded-md bg-neel-900 px-4 py-2 font-semibold text-paper no-underline">
                CSV<span className="sr-only">: {d.sets[s.id].t}</span>
              </a>
              <a href={`/data/${s.id}.json`} className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold no-underline">
                JSON<span className="sr-only">: {d.sets[s.id].t}</span>
              </a>
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="private-h">
          <h2 id="private-h" className="display text-3xl">{d.privacyTitle}</h2>
          <p className="mt-2 text-neel-700">{d.privacy}</p>
        </section>
        <section aria-labelledby="cite-h">
          <h2 id="cite-h" className="display text-3xl">{d.citeTitle}</h2>
          <p className="mt-2 text-neel-700">{d.cite}</p>
          <p className="mt-2 rounded-md bg-white px-3 py-2 font-mono text-[0.9rem] text-neel-900" lang="en">Source: Foundura (foundura.org), {LICENCE.name}</p>
        </section>
      </div>
    </div>
  );
}
