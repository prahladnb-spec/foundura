import { describe, keywordList, seoMetadata, seoTitle } from "@/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeckDownloads } from "@/components/deck-downloads";
import Link from "@/components/locale-link";
import { FORMAT, TemplatePreview } from "@/components/template-preview";
import { docText } from "@/documents/text";
import { CHECKED_ON, checkWith, DOCS, docBySlug, fileName, hasCover, reviewsFor, SOURCES } from "@/documents";
import { Cover } from "@/components/template-cover";
import { f, getDict } from "@/i18n";
import { isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";

type Params = Promise<{ slug: string; lang: string }>;
const langOf = (l: string): Lang => (isLang(l) ? l : "en");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const doc = docBySlug(p.slug);
  if (!doc) return {};
  const lang = langOf(p.lang);
  const s = getDict(lang).documents.seo;
  const { title: name, summary } = docText(doc, lang);
  const already = new RegExp(s.kinds, "i").test(name) || /template|checklist|pack|tracker|model|sheet|plan|script|canvas/i.test(name);
  const noun = already ? name : f(s.noun, { name });
  const format = FORMAT[doc.template.kind];
  return seoMetadata(`/documents/${doc.slug}`, lang, {
    focus: noun,
    title: seoTitle(noun, s.tail),
    description: describe(summary, f(s.download, { format })),
    excerpt: summary,
    keywords: keywordList([noun, f(s.format, { name }), f(s.sample, { name }), f(s.free, { noun }), f(s.india, { noun }), `${doc.title} ${format}`], s.general),
  });
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
  const verify = checkWith(doc);
  const reviews = reviewsFor(doc);
  const others = DOCS.filter((x) => x.category === doc.category && x.slug !== doc.slug);

  const section = (id: string, heading: string, items: string[]) => (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-xl font-semibold">{heading}</h2>
      <ul lang={cond} className="mt-2 max-w-[70ch] list-disc space-y-1.5 ps-5">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </section>
  );

  return (
    <article className="mx-auto max-w-4xl px-5 pt-10">
      <p className="text-slate">
        <Link href="/documents" className="underline">{d.title}</Link>, {d.categories[doc.category]}
      </p>
      <div className={hasCover(doc.slug) ? "grid items-center gap-x-8 md:grid-cols-[minmax(0,1fr)_15rem]" : ""}>
        <div className="min-w-0">
          <h1 className="display mt-2 text-5xl md:text-6xl">{docText(doc, lang).title}</h1>
          <p className="mt-3 max-w-[62ch] text-xl text-neel-700">{docText(doc, lang).summary}</p>
        </div>
        {hasCover(doc.slug) && <Cover slug={doc.slug} eager className="art-settle mt-6 hidden w-60 shadow-[5px_5px_0_var(--color-neel-900)] md:block" />}
      </div>

      {doc.template.kind === "deck" ? (
        <DeckDownloads slug={doc.slug} variants={(doc.variants ?? []).map((v) => v.key)} />
      ) : (
        <>
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
        </>
      )}
      <p className="mt-2 text-[0.93rem] text-slate">{d.free}</p>
      {d.englishOnly && <p className="mt-4 rounded-md bg-neel-50 px-4 py-3 text-neel-700">{d.englishOnly}</p>}

      {(verify.lawyer || verify.ca) && (
        <div role="note" className="mt-6 rounded-xl border-2 border-marigold bg-marigold-50 px-5 py-4 text-marigold-ink">
          <p className="font-semibold">{d.verifyTitle[verify.lawyer && verify.ca ? "both" : verify.lawyer ? "lawyer" : "ca"]}</p>
          {reviews.map((r) => (
            <p key={r.by} className="mt-1">
              {f(d.reviewedBy, { by: r.by, qualification: r.qualification, date: fmtDate(r.on, true, lang) })} {d.reviewedStill}
            </p>
          ))}
          <p className="mt-1">{d.verifyBody}</p>
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
        <ul lang="en" className="mt-1 list-disc space-y-1 ps-5">
          {SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.name}</a></li>)}
        </ul>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="more-h" className="mt-10 border-t-2 border-neel-900 pt-4">
          <h2 id="more-h" className="text-xl font-semibold">{d.more}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {others.map((x) => <li key={x.slug}><Link href={`/documents/${x.slug}`} className="text-neel-500 underline">{docText(x, lang).title}</Link></li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
