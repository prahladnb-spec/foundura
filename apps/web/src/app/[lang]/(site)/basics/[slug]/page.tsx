import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/locale-link";
import { Blocks } from "@/components/basics-blocks";
import { DilutionCalc } from "@/components/dilution-calc";
import { CHAPTERS, CHECKED_ON, chapterBySlug } from "@/basics/chapters";
import { docBySlug } from "@/documents";
import { docText } from "@/documents/text";
import { GLOSSARY, termId, termText } from "@/glossary";
import { getDict } from "@/i18n";
import { contentLang, f, isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { describe, keywordList, seoMetadata, seoTitle } from "@/seo";

type Params = Promise<{ lang: string; slug: string }>;
const langOf = (l: string): Lang => (isLang(l) ? l : "en");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const c = chapterBySlug(p.slug);
  if (!c) return {};
  const lang = langOf(p.lang);
  const d = getDict(lang).basics;
  const x = c[contentLang(lang)];
  return seoMetadata(`/basics/${c.slug}`, lang, {
    type: "article",
    focus: x.keywords[0],
    title: seoTitle(x.title, d.seoTail),
    description: describe(x.summary, d.seoClosing),
    excerpt: x.summary,
    keywords: keywordList([...x.keywords, x.title], [d.seoTail, d.title, "Foundura"]),
  });
}

const HREF = { funding: "/funding", schemes: "/schemes", scan: "/scan", investors: "/investors" } as const;

export default async function ChapterPage({ params }: { params: Params }) {
  const p = await params;
  const c = chapterBySlug(p.slug);
  if (!c) notFound();
  const lang = langOf(p.lang);
  const t = getDict(lang);
  const d = t.basics;
  const cl = contentLang(lang);
  const x = c[cl];
  const en = cl === lang ? undefined : "en";
  const i = CHAPTERS.indexOf(c);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  const terms = c.terms.map((name) => GLOSSARY.find((g) => g.term === name)).filter((g) => g !== undefined);
  const docs = c.docs.map(docBySlug).filter((doc) => doc !== undefined);

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <nav aria-label={d.all} className="text-[0.95rem]">
        <Link href="/basics" className="text-neel-500 underline">{d.title}</Link>
        <span className="text-slate"> › {f(d.chapter, { n: i + 1 })}</span>
      </nav>
      {en && <p className="mt-4 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">{d.inEnglish}</p>}

      <article lang={en}>
        <h1 className="display mt-3 max-w-[22ch] text-5xl md:text-6xl">{x.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{x.summary}</p>
        {x.sections.map((s, k) => (
          <section key={s.h} aria-labelledby={`s-${k}`} className="mt-10">
            <h2 id={`s-${k}`} className="display text-3xl">{s.h}</h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}
      </article>

      {c.calculator && <DilutionCalc />}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {terms.length > 0 && (
          <section aria-labelledby="terms-h">
            <h2 id="terms-h" className="font-display text-lg font-bold">{d.termsTitle}</h2>
            <ul className="mt-2 space-y-1.5">
              {terms.map((g) => {
                const local = termText(g, lang).name;
                return (
                  <li key={g.term}>
                    <Link href={`/glossary#${termId(g.term)}`} className="text-neel-500 underline">
                      <span lang="en">{g.term}</span>
                    </Link>
                    {local && <span className="ms-1 text-slate">({local})</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {docs.length > 0 && (
          <section aria-labelledby="docs-h">
            <h2 id="docs-h" className="font-display text-lg font-bold">{d.docsTitle}</h2>
            <ul className="mt-2 space-y-1.5">
              {docs.map((doc) => {
                const dt = docText(doc, lang);
                return (
                  <li key={doc.slug}>
                    <Link href={`/documents/${doc.slug}`} className="text-neel-500 underline">
                      <span lang={dt.en && lang !== "en" ? "en" : undefined}>{dt.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <section aria-labelledby="next-h">
          <h2 id="next-h" className="font-display text-lg font-bold">{d.nextSteps}</h2>
          <ul className="mt-2 space-y-1.5">
            {c.links.map((l) => (
              <li key={l}><Link href={HREF[l]} className="text-neel-500 underline">{d.links[l]}</Link></li>
            ))}
          </ul>
        </section>
      </div>

      <nav aria-label={d.all} className="mt-12 flex flex-wrap justify-between gap-4 border-t-2 border-neel-900 pt-5">
        {prev ? (
          <Link href={`/basics/${prev.slug}`} className="max-w-[48%] no-underline">
            <span className="block text-[0.9rem] text-slate">{d.prev}</span>
            <span lang={en} className="font-display font-bold text-neel-900 underline">{prev[cl].title}</span>
          </Link>
        ) : (
          <Link href="/basics" className="font-semibold text-neel-500 underline">{d.all}</Link>
        )}
        {next ? (
          <Link href={`/basics/${next.slug}`} className="ms-auto max-w-[48%] text-end no-underline">
            <span className="block text-[0.9rem] text-slate">{d.next}</span>
            <span lang={en} className="font-display font-bold text-neel-900 underline">{next[cl].title}</span>
          </Link>
        ) : (
          <Link href="/basics" className="ms-auto font-semibold text-neel-500 underline">{d.all}</Link>
        )}
      </nav>

      <p className="mt-8 max-w-[68ch] text-[0.95rem] text-slate">{f(d.disclaimer, { date: fmtDate(CHECKED_ON, true, lang) })}</p>
    </div>
  );
}
