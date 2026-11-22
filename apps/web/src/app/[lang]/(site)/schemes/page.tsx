import { pageMetadata } from "@/seo";
import { PageIntro } from "@/components/art";
import { CategoryStamp } from "@/components/icons";
import { SchemeTileMap } from "@/components/infographics/scheme-tile-map";
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

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("schemes", isLang(lang) ? lang : "en");
}

function List({ items, t, lang }: { items: Scheme[]; t: Dict; lang: string }) {
  return (
    <ul className="border-t-2 border-neel-900">
      {items.map((s) => (
        <li key={s.slug} className="grid gap-1 border-b border-rule py-4 md:grid-cols-[1fr_12rem]">
          <div>
            <Link href={`/schemes/${s.slug}`} lang={s.contentLang !== lang ? "en" : undefined} className="text-lg font-semibold hover:underline">{s.name}</Link>
            <p lang={s.contentLang !== lang ? "en" : undefined} className="text-neel-700 max-w-[70ch]">{s.summary}</p>
          </div>
          <p className="flex items-center gap-3 text-[0.92rem] text-slate md:flex-col md:items-end md:gap-1">
            <CategoryStamp category={s.category} label={String(lab(t.labels.category, s.category))} />
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
  const [before, after] = t.schemes.count.split("{link}");
  const schemes = await apiOr<Scheme[]>(`/schemes?lang=${lang}`, []);
  const fellBack = schemes.some((s) => s.contentLang !== lang);
  const national = schemes.filter((s) => s.level === "national");
  const state = schemes.filter((s) => s.level === "state");
  const states = [...new Set(state.map((s) => s.state))];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="schemes">
        <h1 className="display text-6xl md:text-7xl">{t.schemes.title}</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
          {f(before, { n: schemes.length })}<Link href="/scan" className="underline text-neel-500">{t.schemes.runScan}</Link>{after}
        </p>
        {fellBack && t.common.someSchemesInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.someSchemesInEnglish}</p>}
      </PageIntro>
      <SchemeTileMap schemes={schemes} t={t} />
      <h2 id="central" className="display mt-12 mb-3 scroll-mt-6 text-4xl">{t.schemes.central}</h2>
      <List items={national} t={t} lang={lang} />
      {states.map((code) => (
        <section key={code} id={`state-${code}`} className="scroll-mt-6">
          <h2 className="display mt-10 mb-3 text-4xl">{lab(t.labels.state, code)}</h2>
          <List items={state.filter((s) => s.state === code)} t={t} lang={lang} />
        </section>
      ))}
      <p className="mt-10 text-[0.9rem] text-slate">
        {t.schemes.more}
      </p>
    </div>
  );
}
