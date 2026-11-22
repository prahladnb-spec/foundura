import { CategoryStamp } from "@/components/icons";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { f, getDict, lab } from "@/i18n";
import { isLang } from "@/i18n/config";
import { api, ApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { Scheme } from "@/lib/types";

async function load(slug: string, lang = "en"): Promise<Scheme> {
  try {
    return await api<Scheme>(`/schemes/${encodeURIComponent(slug)}${lang === "hi" ? "?lang=hi" : ""}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

type Params = Promise<{ slug: string; lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const s = await load(p.slug, p.lang);
  return { title: s.name, description: s.summary };
}

export default async function SchemePage({ params }: { params: Params }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const sc = t.scheme;
  const s = await load(p.slug, lang);
  // Text is in English when no current Hindi translation exists; issuer and source names stay English.
  const cond = s.contentLang !== lang ? "en" : undefined;
  const nameCond = lang === "en" ? undefined : "en";
  const stateName = s.state ? String(lab(t.labels.state, s.state)) : undefined;
  const stateNameEn = s.state ? String(lab(getDict("en").labels.state, s.state)) : undefined;
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentService",
          name: s.name,
          description: s.summary,
          provider: { "@type": "GovernmentOrganization", name: s.issuer },
          areaServed: { "@type": s.level === "state" ? "State" : "Country", name: stateNameEn ?? "India" },
          audience: { "@type": "BusinessAudience", name: "Startups in India" },
          url: s.sourceUrl,
        }}
      />
      <p className="text-slate">
        <Link href="/schemes" className="underline">{sc.breadcrumb}</Link>
        {stateName ? `, ${stateName}` : `, ${sc.central}`}
      </p>
      <h1 lang={cond} className="display mt-2 text-5xl md:text-6xl">{s.name}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate">
        <CategoryStamp category={s.category} label={String(lab(t.labels.category, s.category))} />
        <span lang={nameCond}>{s.issuer}</span>{" "}
        <span className={s.status === "closed" ? "font-semibold text-marigold-ink" : ""}>{lab(t.labels.schemeStatus, s.status)}</span>
      </p>
      {cond && t.common.schemeInEnglish && <p className="mt-4 text-[0.92rem] text-slate">{t.common.schemeInEnglish}</p>}
      <p lang={cond} className="mt-6 text-lg">{s.summary}</p>
      {s.statusNote && (
        <p lang={cond} className="mt-4 rounded-md border border-marigold bg-marigold-50 px-4 py-3 text-marigold-ink">{s.statusNote}</p>
      )}

      <h2 className="display mt-10 text-3xl">{sc.get}</h2>
      <ul lang={cond} className="mt-3 list-disc pl-5 space-y-1.5">
        {s.benefits.map((b) => <li key={b}>{b}</li>)}
      </ul>

      <h2 className="display mt-10 text-3xl">{sc.apply}</h2>
      <ol lang={cond} className="mt-3 list-decimal pl-5 space-y-1.5">
        {s.howToApply.map((b) => <li key={b}>{b}</li>)}
      </ol>

      {s.alsoCheck.length > 0 && (
        <>
          <h2 className="display mt-10 text-3xl">{sc.alsoCheck}</h2>
          <ul lang={cond} className="mt-3 list-disc pl-5 space-y-1.5">
            {s.alsoCheck.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </>
      )}

      <div className="mt-10 rounded-xl border-2 border-neel-900 p-6">
        <p className="text-lg font-semibold">{sc.ctaTitle}</p>
        <p className="mt-1 text-neel-700">{sc.ctaBody}</p>
        <Link href="/scan" className="mt-4 inline-block rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">
          {sc.ctaButton}
        </Link>
      </div>

      <p className="mt-8 text-[0.92rem] text-slate">
        {sc.official} <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" lang={nameCond} className="underline">{s.sourceName}</a>.{" "}
        {s.lastVerifiedAt ? f(sc.checked, { date: fmtDate(s.lastVerifiedAt, true, lang) }) : sc.unchecked}
      </p>
    </article>
  );
}
