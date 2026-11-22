import type { Metadata } from "next";
import { DocumentsFinder } from "@/components/documents-finder";
import Link from "@/components/locale-link";
import { FORMAT } from "@/components/template-preview";
import { CATEGORIES, CHECKED_ON, DOCS } from "@/documents";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getDict(await langOf(params));
  return { title: t.documents.metaTitle, description: t.documents.metaDescription };
}

export default async function DocumentsHub({ params }: { params: Params }) {
  const lang = await langOf(params);
  const d = getDict(lang).documents;
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
      <p className="mt-3 max-w-[64ch] text-lg text-neel-700">{d.lead}</p>
      <p className="mt-2 text-slate">{f(d.count, { n: DOCS.length })} {d.free}</p>

      <section aria-labelledby="finder-h" className="mt-10 rounded-xl border-2 border-neel-900 p-6 md:p-8">
        <h2 id="finder-h" className="display mb-6 text-4xl">{d.finderTitle}</h2>
        <DocumentsFinder docs={Object.fromEntries(DOCS.map((x) => [x.slug, { title: x.title, titleHi: x.titleHi, kind: x.template.kind }]))} />
      </section>

      <h2 className="display mt-14 text-4xl">{d.all}</h2>
      {CATEGORIES.filter((c) => DOCS.some((x) => x.category === c)).map((c) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="mt-8">
          <h3 id={`cat-${c}`} className="border-b-2 border-neel-900 pb-2 text-xl font-semibold">{d.categories[c]}</h3>
          <ul className="grid gap-x-8 md:grid-cols-2">
            {DOCS.filter((x) => x.category === c).map((x) => (
              <li key={x.slug} className="border-b border-rule py-4">
                <p>
                  <Link href={`/documents/${x.slug}`} className="text-lg font-semibold hover:underline">{lang === "hi" ? x.titleHi : x.title}</Link>{" "}
                  <span lang="en" className="ml-1 rounded border border-rule px-1.5 py-0.5 text-[0.8rem] text-slate">{FORMAT[x.template.kind]}</span>
                </p>
                <p className="mt-1 text-neel-700">{lang === "hi" ? x.summaryHi : x.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-10 text-neel-700">
        {d.glossaryNote.split("{link}")[0]}
        <Link href="/glossary" className="text-neel-500 underline">{d.glossaryLink}</Link>
        {d.glossaryNote.split("{link}")[1]}
      </p>
      <p className="mt-3 max-w-[70ch] text-[0.93rem] text-slate">
        {d.notAdvice} {f(d.checked, { date: fmtDate(CHECKED_ON, true, lang) })}
      </p>
    </div>
  );
}
