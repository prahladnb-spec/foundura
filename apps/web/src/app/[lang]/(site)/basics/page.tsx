import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { CHAPTERS, CHECKED_ON } from "@/basics/chapters";
import { getDict } from "@/i18n";
import { contentLang, f, isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("basics", isLang(lang) ? lang : "en");
}

export default async function BasicsPage({ params }: { params: Params }) {
  const p = await params;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const d = getDict(lang).basics;
  const cl = contentLang(lang);
  // Chapter titles and summaries are English except on English and Hindi pages.
  const en = cl === lang ? undefined : "en";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="learn">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      </PageIntro>

      <section aria-labelledby="path-h" className="mt-10 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
        <h2 id="path-h" className="display text-3xl">{d.pathTitle}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-5">
          {d.path.map((s, i) => (
            <li key={s.t} className="border-t-2 border-marigold pt-3">
              <span className="font-display text-sm font-bold text-marigold">{i + 1}</span>
              <span className="mt-1 block font-display text-lg font-bold leading-tight">{s.t}</span>
              <span className="mt-1 block text-[0.95rem] text-neel-100">{s.d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ch-h" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="ch-h" className="display text-4xl">{d.chaptersTitle}</h2>
          <Link href={`/basics/${CHAPTERS[0].slug}`} className="font-semibold text-neel-500 underline">{d.start}</Link>
        </div>
        {en && <p className="mt-3 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">{d.inEnglish}</p>}
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {CHAPTERS.map((c, i) => {
            const x = c[cl];
            return (
              <li key={c.slug} className="rounded-xl border border-rule bg-white p-5">
                <p className="text-[0.9rem] font-semibold text-slate">{f(d.chapter, { n: i + 1 })}</p>
                <h3 lang={en} className="mt-1 font-display text-xl font-bold leading-snug">
                  <Link href={`/basics/${c.slug}`} className="no-underline hover:underline">{x.title}</Link>
                </h3>
                <p lang={en} className="mt-2 text-[0.95rem] text-neel-700">{x.summary}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-10 max-w-[68ch] text-[0.95rem] text-slate">{f(d.disclaimer, { date: fmtDate(CHECKED_ON, true, lang) })}</p>
    </div>
  );
}
