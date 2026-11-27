import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { contentLang, f, type Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import { stateLabel } from "@/lib/labels";
import { docBySlug } from "@/documents";
import { docText } from "@/documents/text";
import type { ArticleSummary, Scheme } from "@/lib/types";
import { CHECKED_ON as SUPPORT_CHECKED, GATHERED_ON as SUPPORT_GATHERED } from "@/support/directory";
import { SupportList } from "@/app/[lang]/(site)/states/support-list";
import { PATENT_OFFICES, patentText } from "@/founders/patents";
import {
  CHECKED_ON,
  FOUNDER_GUIDES,
  GUIDE_LINKS,
  GUIDE_PATH,
  GUIDE_SOURCES,
  corporateSteps,
  guideEntries,
  guideText,
  sharedText,
  type FounderGuide,
} from "@/founders/guides";

/**
 * One founder guide page (/mentors, /coworking, /students, /women, /selling): the steps, the matching
 * support directory entries (India-wide, then by state), schemes, templates, guides and sources.
 * English and Hindi; other languages read the English, marked as such.
 */
export async function FounderGuidePage({ guide, lang }: { guide: FounderGuide; lang: Lang }) {
  const cl = contentLang(lang);
  const t = guideText[cl][guide];
  const s = sharedText[cl];
  const guideLang = cl === lang ? undefined : "en";
  const d = getDict(lang);
  const en = lang === "en" ? undefined : "en";
  const links = GUIDE_LINKS[guide];

  const [schemes, articles] = await Promise.all([
    links.schemes.length ? apiOr<Scheme[]>(`/schemes?lang=${lang}`, []) : Promise.resolve([] as Scheme[]),
    apiOr<ArticleSummary[]>("/articles", []),
  ]);
  const bySlug = new Map(schemes.map((x) => [x.slug, x]));
  const schemeList = links.schemes.map((x) => bySlug.get(x)).filter((x): x is Scheme => !!x);
  const guides = links.guides.map((x) => articles.find((a) => a.slug === x)).filter((a): a is ArticleSummary => !!a);
  const docs = links.docs.map((x) => docBySlug(x)).filter((x): x is NonNullable<typeof x> => !!x);

  const entries = guideEntries(guide);
  const national = entries.filter((e) => e.geo === "IN");
  const byState = new Map<string, typeof entries>();
  for (const e of entries.filter((x) => x.geo !== "IN")) byState.set(e.geo, [...(byState.get(e.geo) ?? []), e]);
  const states = [...byState.keys()].sort((a, b) => stateLabel(a, lang).localeCompare(stateLabel(b, lang), lang));
  const corp = guide === "selling" ? corporateSteps[cl] : null;
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  const ft = d.chrome.footer;
  // The language the surrounding text is in, and a lang attribute only where a piece differs from it.
  const ctx = guideLang ?? lang;
  const mark = (l: string) => (l === ctx ? undefined : l);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      {guideLang && <p className="mb-4 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">{d.common.pageInEnglish}</p>}
      <div lang={guideLang}>
        <p className="text-slate">{s.breadcrumb}</p>
        <h1 className="display mt-2 max-w-[20ch] text-6xl md:text-7xl">{t.title}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-neel-700">{t.lead}</p>

        <Steps id="steps-h" title={t.stepsTitle} steps={t.steps} />
        {corp && <Steps id="corp-steps-h" title={corp.title} steps={corp.steps} />}
        {guide === "patents" && <PatentExtras cl={cl} mark={mark} />}

        {entries.length > 0 && (
        <section aria-labelledby="list-h" className="mt-14">
          <h2 id="list-h" className="display text-4xl">{t.listTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-neel-700">{t.listLead}</p>
          <div lang={mark(lang)}>
          {national.length > 0 && (
            <>
              {states.length > 0 && <h3 className="mt-6 text-2xl font-semibold">{t.listNational}</h3>}
              <SupportList entries={national} lang={lang} en={en} desks={guide === "coworking"} level={states.length ? 4 : 3} />
            </>
          )}
          {states.length > 0 && (
            <>
              {national.length > 0 && <h3 className="mt-10 text-2xl font-semibold">{t.listStates}</h3>}
              {states.map((code) => (
                <div key={code} className="mt-6">
                  <h3 className="text-xl font-semibold">
                    <Link href={`/states/${code.toLowerCase()}`} className="underline">{stateLabel(code, lang)}</Link>
                  </h3>
                  <SupportList entries={byState.get(code)!} lang={lang} en={en} desks={guide === "coworking"} level={4} />
                </div>
              ))}
            </>
          )}
          </div>
          <p className="mt-6 text-[0.93rem] text-slate">
            {SUPPORT_CHECKED ? null : <>{f(s.unchecked, { date: fmtDate(SUPPORT_GATHERED, true, lang) })} </>}
            <a href={`mailto:${support}?subject=${encodeURIComponent(`Support directory: ${GUIDE_PATH[guide]}`)}`} className="underline">{s.missing}</a>
          </p>
        </section>
        )}

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          {schemeList.length > 0 && (
            <section aria-labelledby="schemes-h">
              <h2 id="schemes-h" className="display text-3xl">{s.schemesTitle}</h2>
              <p className="mt-1 text-neel-700">
                {s.schemesLead} <Link href="/scan" className="text-neel-500 underline">{s.scanLink}</Link>
              </p>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {schemeList.map((x) => (
                  <li key={x.slug} className="py-3">
                    <Link href={`/schemes/${x.slug}`} lang={mark(x.contentLang)} className="font-semibold">{x.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="docs-h">
            <h2 id="docs-h" className="display text-3xl">{s.docsTitle}</h2>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {docs.map((doc) => {
                const x = docText(doc, lang);
                return (
                  <li key={doc.slug} className="py-3">
                    <Link href={`/documents/${doc.slug}`} lang={mark(x.en ? "en" : lang)} className="font-semibold">{x.title}</Link>
                  </li>
                );
              })}
            </ul>
          </section>
          {guides.length > 0 && (
            <section aria-labelledby="guides-h">
              <h2 id="guides-h" className="display text-3xl">{s.guidesTitle}</h2>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {guides.map((a) => (
                  <li key={a.slug} className="py-3">
                    <Link href={`/learn/${a.slug}`} lang={mark("en")} className="font-semibold">{a.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="related-h">
            <h2 id="related-h" className="display text-3xl">{s.related}</h2>
            <ul className="mt-4 divide-y divide-rule border-y border-rule" lang={mark(lang)}>
              {FOUNDER_GUIDES.filter((g) => g !== guide).map((g) => (
                <li key={g} className="py-3">
                  <Link href={GUIDE_PATH[g]} className="font-semibold">{ft[g]}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="src-h" className="mt-16 border-t border-rule pt-6 text-[0.93rem]">
          <p className="max-w-[75ch] text-slate">{f(s.checked, { date: fmtDate(CHECKED_ON, true, lang) })}</p>
          <h2 id="src-h" className="mt-4 font-semibold">{s.sourcesTitle}</h2>
          <ul lang={mark("en")} className="mt-2 space-y-1">
            {GUIDE_SOURCES[guide].map((x) => (
              <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.name}</a></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Steps({ id, title, steps }: { id: string; title: string; steps: { title: string; body: string }[] }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="display text-4xl">{title}</h2>
      <ol className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
        {steps.map((x, i) => (
          <li key={x.title} className="flex gap-4 border-t-2 border-neel-900 pt-3">
            <span aria-hidden="true" className="font-display text-3xl font-extrabold leading-none text-marigold-ink">{i + 1}</span>
            <span>
              <h3 className="text-lg font-semibold leading-snug">{x.title}</h3>
              <p className="mt-1 text-neel-700">{x.body}</p>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The /patents guide's extra parts: filing abroad, the deadline timeline and the main patent offices. */
function PatentExtras({ cl, mark }: { cl: "en" | "hi"; mark: (l: string) => string | undefined }) {
  const p = patentText[cl];
  return (
    <>
      <Steps id="abroad-h" title={p.abroadTitle} steps={p.abroadSteps} />

      <section aria-labelledby="timeline-h" className="mt-14">
        <h2 id="timeline-h" className="display text-4xl">{p.timelineTitle}</h2>
        <p className="mt-2 max-w-[62ch] text-neel-700">{p.timelineLead}</p>
        <ol className="mt-6 border-s-2 border-neel-900">
          {p.timeline.map((x) => (
            <li key={x.when} className="relative grid gap-1 py-3 ps-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <span aria-hidden="true" className="absolute -start-[7px] top-[1.15rem] h-3 w-3 rounded-full border-2 border-neel-900 bg-marigold" />
              <span className="font-semibold text-marigold-ink">{x.when}</span>
              <span className="text-neel-700">{x.what}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="offices-h" className="mt-14">
        <h2 id="offices-h" className="display text-4xl">{p.officesTitle}</h2>
        <p className="mt-2 max-w-[62ch] text-neel-700">{p.officesLead}</p>
        <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
          {PATENT_OFFICES.map((o, i) => (
            <li key={o.url} className="border-t border-rule py-4">
              <p lang={mark("en")} className="text-[0.88rem] text-slate">{o.where}</p>
              <a href={o.url} target="_blank" rel="noopener noreferrer" lang={mark("en")} className="font-semibold">{o.name}</a>
              <p className="mt-1 text-[0.95rem] text-neel-700">{p.officeNotes[i]}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[70ch] rounded-md bg-marigold-50 px-4 py-3 text-neel-900">{p.agent}</p>
      </section>
    </>
  );
}
