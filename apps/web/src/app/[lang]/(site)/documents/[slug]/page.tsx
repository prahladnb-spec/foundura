import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/locale-link";
import { FORMAT, TemplatePreview } from "@/components/template-preview";
import { CHECKED_ON, DOCS, docBySlug, fileName, SOURCES } from "@/documents";
import { f, getDict } from "@/i18n";
import { isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";

type Params = Promise<{ slug: string; lang: string }>;
const langOf = (l: string): Lang => (isLang(l) ? l : "en");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const doc = docBySlug(p.slug);
  if (!doc) return {};
  const hi = langOf(p.lang) === "hi";
  return { title: hi ? doc.titleHi : `${doc.title}: free template and guide`, description: hi ? doc.summaryHi : doc.summary };
}

export default async function DocumentPage({ params }: { params: Params }) {
  const p = await params;
  const lang = langOf(p.lang);
  const doc = docBySlug(p.slug);
  if (!doc) notFound();
  const t = getDict(lang);
  const d = t.documents;
  const cond = lang === "en" ? undefined : "en";
  const [before, after] = d.download.split("{format}");
  const others = DOCS.filter((x) => x.category === doc.category && x.slug !== doc.slug);

  const section = (id: string, heading: string, items: string[]) => (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-xl font-semibold">{heading}</h2>
      <ul lang={cond} className="mt-2 max-w-[70ch] list-disc space-y-1.5 pl-5">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </section>
  );

  return (
    <article className="mx-auto max-w-4xl px-5 pt-10">
      <p className="text-slate">
        <Link href="/documents" className="underline">{d.title}</Link>, {d.categories[doc.category]}
      </p>
      <h1 className="display mt-2 text-5xl md:text-6xl">{lang === "hi" ? doc.titleHi : doc.title}</h1>
      <p className="mt-3 max-w-[62ch] text-xl text-neel-700">{lang === "hi" ? doc.summaryHi : doc.summary}</p>

      <p className="mt-6">
        <a href={`/downloads/${fileName(doc)}`} download className="inline-block rounded-md bg-marigold px-5 py-3 font-semibold text-neel-950 no-underline">
          {before}<span lang="en">{FORMAT[doc.template.kind]}</span>{after}
        </a>
      </p>
      {doc.variants && (
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {doc.variants.map((v) => (
            <a key={v.key} href={`/downloads/${fileName(doc, v.key)}`} download className="font-semibold text-neel-500 underline">
              {v.key === "hi" ? d.downloadHi : d.downloadExample}
            </a>
          ))}
        </p>
      )}
      <p className="mt-2 text-[0.93rem] text-slate">{d.free}</p>
      {d.englishOnly && <p className="mt-4 rounded-md bg-neel-50 px-4 py-3 text-neel-700">{d.englishOnly}</p>}

      {doc.lawyer && (
        <div role="note" className="mt-6 rounded-xl border-2 border-marigold bg-marigold-50 px-5 py-4">
          <p className="font-semibold text-marigold-ink">{d.lawyerTitle}</p>
          <p className="mt-1 text-marigold-ink">{d.lawyerBody}</p>
        </div>
      )}

      <section aria-labelledby="when-h" className="mt-8">
        <h2 id="when-h" className="text-xl font-semibold">{d.when}</h2>
        <p lang={cond} className="mt-2 max-w-[70ch]">{doc.when}</p>
      </section>
      {section("include-h", d.include, doc.include)}
      {section("india-h", d.india, doc.india)}
      {section("mistakes-h", d.mistakes, doc.mistakes)}

      <section aria-labelledby="preview-h" className="mt-10">
        <h2 id="preview-h" className="display mb-4 text-4xl">{d.preview}</h2>
        <TemplatePreview template={doc.template} slideLabel={(n) => f(d.slide, { n })} tabLabel={d.tab} />
      </section>

      <p className="mt-8 max-w-[70ch] text-[0.93rem] text-slate">
        {d.notAdvice} {f(d.checked, { date: fmtDate(CHECKED_ON, true, lang) })}
      </p>
      <section aria-labelledby="sources-h" className="mt-4 text-[0.93rem] text-slate">
        <h2 id="sources-h" className="font-semibold">{d.sources}</h2>
        <ul lang="en" className="mt-1 list-disc space-y-1 pl-5">
          {SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.name}</a></li>)}
        </ul>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="more-h" className="mt-10 border-t-2 border-neel-900 pt-4">
          <h2 id="more-h" className="text-xl font-semibold">{d.more}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {others.map((x) => <li key={x.slug}><Link href={`/documents/${x.slug}`} className="text-neel-500 underline">{lang === "hi" ? x.titleHi : x.title}</Link></li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
