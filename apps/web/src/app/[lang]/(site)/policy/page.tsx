import { FeedLink } from "@/components/feed-link";
import { pageMetadata } from "@/seo";
import { PageIntro } from "@/components/art";
import type { Metadata } from "next";
import { apiOr } from "@/lib/api";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import type { PolicyItem } from "@/lib/types";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("policy", isLang(lang) ? lang : "en");
}

export default async function PolicyPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const cond = lang === "en" ? undefined : "en";
  const items = await apiOr<PolicyItem[]>("/policy", []);
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <FeedLink id="policy" />
      <PageIntro art="policy">
        <h1 className="display text-6xl md:text-7xl">{t.policy.title}</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-neel-700">{t.policy.lead}</p>
        {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      </PageIntro>
      <ol className="mt-8 border-t-2 border-neel-900">
        {items.map((p) => (
          <li key={p.slug} id={`policy-${p.slug}`} className="scroll-mt-24 border-b border-rule py-6">
            <p className="text-[0.92rem] text-slate">
              {fmtDate(p.date, true, lang)}, <span lang={cond}>{p.country}, {p.instrument.toLowerCase()}, {p.stage.toLowerCase()}</span>
              {p.impact === "High" && (
                <span className="ms-2 rounded bg-marigold px-1.5 py-0.5 text-[0.8rem] font-semibold text-neel-950">{t.policy.highImpact}</span>
              )}
            </p>
            <h2 lang={cond} className="mt-1 text-2xl font-semibold leading-snug">{p.headline}</h2>
            {p.amount && <p lang={cond} className="mt-1 font-semibold text-neel-700">{p.amount}</p>}
            <p className="mt-2 max-w-[68ch]">
              <span className="font-semibold">{t.policy.forFounders}</span>
              <span lang={cond}>{p.takeaway}</span>
            </p>
            <p className="mt-2 text-[0.88rem]">
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline text-slate">{t.common.source.split("{name}")[0]}<span lang={cond}>{p.sourceName}</span></a>
            </p>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-slate">{t.policy.empty}</li>}
      </ol>
    </div>
  );
}
