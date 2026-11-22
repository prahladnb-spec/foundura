import { clip, describe, keywordList, seoMetadata, seoTitle } from "@/seo";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { chequeRange, investorTypeLabel, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import type { InvestorPublic } from "@/lib/types";

async function load(slug: string): Promise<InvestorPublic> {
  try {
    return await api<InvestorPublic>(`/investors/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

type Params = Promise<{ slug: string; lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const k = getDict(lang).seoText.investor;
  const i = await load(p.slug);
  const name = i.firm ?? i.name;
  const type = investorTypeLabel(i.type, lang);
  const sectors = i.sectors.map((x) => sectorLabel(x, lang));
  const summary = i.bio ?? f(k.summary, { type, sectors: sectors.join(", ") });
  return seoMetadata(`/investors/${i.slug}`, lang, {
    focus: name,
    title: seoTitle(name, f(k.tail, { type })),
    description: describe(summary, k.check),
    excerpt: clip(summary, 300),
    keywords: keywordList([name, i.firm ? i.name : null, type, ...sectors.map((x) => f(k.sector, { x })), ...i.stages.map((s) => stageLabel(s, lang))], k.general),
  });
}

export default async function InvestorPage({ params }: { params: Params }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const iv = t.investor;
  const cond = lang === "en" ? undefined : "en";
  const i = await load(p.slug);
  const rows: [string, string][] = [
    [iv.type, investorTypeLabel(i.type, lang)],
    [iv.sectors, i.sectors.map((x) => sectorLabel(x, lang)).join(", ")],
    [iv.stages, i.stages.map((x) => stageLabel(x, lang)).join(", ")],
    [iv.where, i.states.length ? i.states.map((x) => stateLabel(x, lang)).join(", ") : iv.acrossIndia],
    [iv.cheque, chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh, lang)],
  ];
  if (typeof i.responseRatePct === "number") rows.push([iv.replies, `${i.responseRatePct}%`]);

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <p className="text-slate"><Link href="/investors" className="underline">{t.investors.title}</Link></p>
      <h1 lang={cond} className="display mt-2 text-5xl md:text-6xl">{i.firm ?? i.name}</h1>
      <p className="mt-2 text-slate">
        {i.firm ? i.name : investorTypeLabel(i.type, lang)}
        {i.verified ? iv.verified : iv.unverified}
      </p>
      {i.bio && <p lang={cond} className="mt-6 text-lg max-w-[65ch]">{i.bio}</p>}
      <dl className="mt-8 border-t-2 border-neel-900">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 border-b border-rule py-3">
            <dt className="font-semibold">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {i.website && (
        <p className="mt-4">
          <a href={i.website} target="_blank" rel="noopener noreferrer" className="underline text-neel-500">{iv.website}</a>
        </p>
      )}
      <div className="mt-10 rounded-xl border-2 border-neel-900 p-6">
        <p className="text-lg font-semibold">{iv.ctaTitle}</p>
        <p className="mt-1 text-neel-700">{iv.ctaBody}</p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">
          {iv.ctaButton}
        </Link>
      </div>
    </article>
  );
}
