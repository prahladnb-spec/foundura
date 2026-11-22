import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { type Dict, f, getDict, lab } from "@/i18n";
import { isLang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import type { Scheme } from "@/lib/types";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getDict(await langOf(params));
  return { title: t.schemes.metaTitle, description: t.schemes.metaDescription };
}

function List({ items, t, cond }: { items: Scheme[]; t: Dict; cond?: string }) {
  return (
    <ul className="border-t-2 border-neel-900">
      {items.map((s) => (
        <li key={s.slug} className="grid gap-1 border-b border-rule py-4 md:grid-cols-[1fr_12rem]">
          <div>
            <Link href={`/schemes/${s.slug}`} lang={cond} className="text-lg font-semibold hover:underline">{s.name}</Link>
            <p lang={cond} className="text-neel-700 max-w-[70ch]">{s.summary}</p>
          </div>
          <p className="text-[0.92rem] text-slate md:text-right">
            {lab(t.labels.category, s.category)}
            <br />
            <span className={s.status === "closed" ? "font-semibold text-marigold-ink" : ""}>{lab(t.labels.schemeStatus, s.status)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function SchemesPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const cond = lang === "en" ? undefined : "en";
  const [before, after] = t.schemes.count.split("{link}");
  const schemes = await apiOr<Scheme[]>("/schemes", []);
  const national = schemes.filter((s) => s.level === "national");
  const state = schemes.filter((s) => s.level === "state");
  const states = [...new Set(state.map((s) => s.state))];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{t.schemes.title}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
        {f(before, { n: schemes.length })}<Link href="/scan" className="underline text-neel-500">{t.schemes.runScan}</Link>{after}
      </p>
      {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      <h2 className="display mt-10 mb-3 text-4xl">{t.schemes.central}</h2>
      <List items={national} t={t} cond={cond} />
      {states.map((code) => (
        <section key={code}>
          <h2 className="display mt-10 mb-3 text-4xl">{lab(t.labels.state, code)}</h2>
          <List items={state.filter((s) => s.state === code)} t={t} cond={cond} />
        </section>
      ))}
      <p className="mt-10 text-[0.9rem] text-slate">
        {t.schemes.more}
      </p>
    </div>
  );
}
