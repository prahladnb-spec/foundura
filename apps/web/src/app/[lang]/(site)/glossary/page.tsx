import { pageMetadata } from "@/seo";
import { PageIntro } from "@/components/art";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { GLOSSARY, termId, termText } from "@/glossary";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("glossary", isLang(lang) ? lang : "en");
}

export default async function GlossaryPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const d = getDict(lang).glossary;
  const letters = [...new Set(GLOSSARY.map((g) => g.term[0].toUpperCase()))];
  const [before, after] = d.more.split("{link}");
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <PageIntro art="glossary">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      </PageIntro>
      <nav aria-label={d.jump} className="mt-6 flex flex-wrap gap-1.5">
        {letters.map((l) => (
          <a key={l} href={`#${l}`} lang="en" className="grid h-9 w-9 place-items-center rounded border border-rule bg-white font-semibold no-underline">{l}</a>
        ))}
      </nav>
      {letters.map((l) => (
        <section key={l} aria-labelledby={l} className="mt-8">
          <h2 id={l} lang="en" className="display border-b-2 border-neel-900 pb-1 text-3xl">{l}</h2>
          <dl>
            {GLOSSARY.filter((g) => g.term[0].toUpperCase() === l).map((g) => {
              const x = termText(g, lang);
              return (
                <div key={g.term} id={termId(g.term)} className="scroll-mt-28 border-b border-rule py-4 target:bg-marigold-50">
                  <dt className="text-lg font-semibold">
                    <span lang="en">{g.term}</span>
                    {x.name && <span className="ms-2 font-normal text-slate">({x.name})</span>}
                  </dt>
                  <dd lang={x.en && lang !== "en" ? "en" : undefined} className="mt-1 max-w-[68ch]">{x.def}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
      <p className="mt-8 text-neel-700">
        {before}
        <Link href="/documents" className="text-neel-500 underline">{d.moreLink}</Link>
        {after}
      </p>
    </div>
  );
}
