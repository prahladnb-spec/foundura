import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { contentLang, f, type Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { chequeRange, investorTypeLabel } from "@/lib/labels";
import { docBySlug } from "@/documents";
import { docText } from "@/documents/text";
import type { ArticleSummary, InvestorPublic, Scheme } from "@/lib/types";
import type { SectorGuide } from "@/sectors/guide";

/** A sector guide page: the path, the key facts, schemes, templates, guides, investors and official sources. */
export async function SectorGuidePage({ guide, lang }: { guide: SectorGuide; lang: Lang }) {
  // Written in English and Hindi; other languages read the English, marked as such.
  const t = guide.text[contentLang(lang)];
  const guideLang = contentLang(lang) === lang ? undefined : "en";
  const d = getDict(lang);
  const nameCond = lang === "en" ? undefined : "en";

  const [schemes, investors, articles] = await Promise.all([
    apiOr<Scheme[]>(`/schemes?lang=${lang}`, []),
    guide.investorSector ? apiOr<InvestorPublic[]>(`/investors?sector=${guide.investorSector}`, [], 0) : Promise.resolve([] as InvestorPublic[]),
    apiOr<ArticleSummary[]>("/articles", []),
  ]);
  const bySlug = new Map(schemes.map((s) => [s.slug, s]));
  const list = guide.schemes.map((s) => bySlug.get(s)).filter((s): s is Scheme => !!s);
  const guides = guide.guides.map((s) => articles.find((a) => a.slug === s)).filter((a): a is ArticleSummary => !!a);
  const docs = guide.docs.map((s) => docBySlug(s)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      {guideLang && <p className="mb-4 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">{d.common.pageInEnglish}</p>}
      <div lang={guideLang}>
        <p className="text-slate">{t.breadcrumb}</p>
        <h1 className="display mt-2 max-w-[20ch] text-6xl md:text-7xl">{t.title}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-neel-700">{t.lead}</p>

        <section aria-labelledby="steps-h" className="mt-12">
          <h2 id="steps-h" className="display text-4xl">{t.stepsTitle}</h2>
          <ol className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {t.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 border-t-2 border-neel-900 pt-3">
                <span aria-hidden="true" className="font-display text-3xl font-extrabold leading-none text-marigold-ink">{i + 1}</span>
                <span>
                  <h3 className="text-lg font-semibold leading-snug">{s.title}</h3>
                  <p className="mt-1 text-neel-700">{s.body}</p>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="facts-h" className="mt-14 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8">
          <h2 id="facts-h" className="display text-3xl">{t.factsTitle}</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
            {t.facts.map((m) => (
              <div key={m.t}>
                <dt className="font-semibold">{m.t}</dt>
                <dd className="text-neel-700">{m.d}</dd>
              </div>
            ))}
          </dl>
          {t.factsNote && <p className="mt-4 text-[0.93rem] text-slate">{t.factsNote}</p>}
        </section>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <section aria-labelledby="schemes-h">
            <h2 id="schemes-h" className="display text-3xl">{t.schemesTitle}</h2>
            <p className="mt-1 text-neel-700">
              {t.schemesLead} <Link href="/scan" className="text-neel-500 underline">{t.scanLink}</Link>
            </p>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {list.map((s) => (
                <li key={s.slug} className="py-3">
                  <Link href={`/schemes/${s.slug}`} lang={s.contentLang === lang ? undefined : "en"} className="font-semibold">{s.name}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="docs-h">
            <h2 id="docs-h" className="display text-3xl">{t.docsTitle}</h2>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {docs.map((doc) => {
                const x = docText(doc, lang);
                return (
                  <li key={doc.slug} className="py-3">
                    <Link href={`/documents/${doc.slug}`} lang={x.en && lang !== "en" ? "en" : undefined} className="font-semibold">{x.title}</Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <section aria-labelledby="guides-h">
            <h2 id="guides-h" className="display text-3xl">{t.guidesTitle}</h2>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {guides.map((a) => (
                <li key={a.slug} className="py-3">
                  <Link href={`/learn/${a.slug}`} lang={nameCond} className="font-semibold">{a.title}</Link>
                </li>
              ))}
            </ul>
          </section>
          {guide.investorSector && (
            <section aria-labelledby="inv-h">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 id="inv-h" className="display text-3xl">{t.investorsTitle}</h2>
                <Link href={`/investors?sector=${guide.investorSector}`} className="text-neel-500 underline">{t.investorsBrowse}</Link>
              </div>
              {investors.length === 0 ? (
                <p className="mt-3 text-slate">{t.investorsEmpty}</p>
              ) : (
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {investors.slice(0, 5).map((i) => (
                    <li key={i.id} className="py-3">
                      <Link href={`/investors/${i.slug}`} lang={nameCond} className="font-semibold">{i.firm ?? i.name}</Link>
                      <p className="text-[0.93rem] text-slate">{investorTypeLabel(i.type, lang)}; {chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh, lang)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <section aria-labelledby="src-h" className="mt-16 border-t border-rule pt-6 text-[0.93rem]">
          <p className="max-w-[75ch] text-slate">{f(t.checked, { date: fmtDate(guide.checkedOn, true, lang) })}</p>
          <h2 id="src-h" className="mt-4 font-semibold">{t.sourcesTitle}</h2>
          <ul lang={nameCond} className="mt-2 space-y-1">
            {guide.sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
