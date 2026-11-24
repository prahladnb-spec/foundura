import { pageMetadata } from "@/seo";
import { MIN_READINESS_FOR_INTRO } from "@foundura/shared";
import { Steps } from "@/components/infographics/steps";
import { Art, PageIntro } from "@/components/art";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { SECTORS, STAGES } from "@foundura/shared";
import { apiOr } from "@/lib/api";
import { f, getDict, lab } from "@/i18n";
import { isLang } from "@/i18n/config";
import { chequeRange, investorTypeLabel, sectorLabel, stageLabel } from "@/lib/labels";
import type { InvestorPublic } from "@/lib/types";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("investors", isLang(lang) ? lang : "en");
}

export default async function InvestorsPage({ params, searchParams }: { params: Params; searchParams: Promise<{ sector?: string; stage?: string }> }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const iv = t.investors;
  const cond = lang === "en" ? undefined : "en";
  const [before, after] = iv.emptyMore.split("{link}");
  const { sector, stage } = await searchParams;
  const q = new URLSearchParams();
  if (sector) q.set("sector", sector);
  if (stage) q.set("stage", stage);
  const list = await apiOr<InvestorPublic[]>(`/investors${q.size ? `?${q}` : ""}`, [], 0);
  const select = "rounded-md border border-rule bg-white px-3 py-2";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="investors">
        <h1 className="display text-6xl md:text-7xl">{iv.title}</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{iv.lead}</p>
        <p className="mt-3 max-w-[62ch] text-neel-700">
          {iv.directory.split("{link}")[0]}
          <Link href="/funding" className="font-semibold text-neel-500 underline">{iv.directoryLink}</Link>
          {iv.directory.split("{link}")[1]}
        </p>
      </PageIntro>
      <section aria-labelledby="how-h" className="mt-10 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8">
        <h2 id="how-h" className="display mb-6 text-3xl">{iv.how.title}</h2>
        <Steps cols={4} label={iv.how.title} steps={iv.how.steps.map((s) => ({ t: f(s.t, { n: MIN_READINESS_FOR_INTRO }), d: s.d }))} />
      </section>
      <form className="mt-10 flex flex-wrap items-end gap-3" method="get">
        <label>
          <span className="block text-[0.9rem] font-semibold mb-1">{iv.sector}</span>
          <select name="sector" defaultValue={sector ?? ""} className={select}>
            <option value="">{iv.allSectors}</option>
            {SECTORS.map((s) => <option key={s.value} value={s.value}>{lab(t.labels.sector, s.value)}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-[0.9rem] font-semibold mb-1">{iv.stage}</span>
          <select name="stage" defaultValue={stage ?? ""} className={select}>
            <option value="">{iv.allStages}</option>
            {STAGES.map((s) => <option key={s.value} value={s.value}>{lab(t.labels.stage, s.value)}</option>)}
          </select>
        </label>
        <button className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold">{iv.filter}</button>
      </form>

      <ul className="mt-8 border-t-2 border-neel-900">
        {list.map((i) => (
          <li key={i.id} className="grid gap-2 border-b border-rule py-5 md:grid-cols-[1fr_14rem]">
            <div>
              <Link href={`/investors/${i.slug}`} lang={cond} className="text-xl font-semibold hover:underline">
                {i.firm ? `${i.firm}` : i.name}
              </Link>
              {i.verified && <span className="ms-2 rounded border border-leaf px-1.5 text-[0.8rem] font-semibold text-leaf">{iv.verified}</span>}
              <p className="text-[0.93rem] text-slate">
                {investorTypeLabel(i.type, lang)}
                {i.firm ? <span lang={cond}>, {i.name}</span> : ""}
              </p>
              <p className="mt-1">{i.sectors.map((x) => sectorLabel(x, lang)).join(", ")}</p>
            </div>
            <p className="text-[0.93rem] text-neel-700 md:text-end">
              {chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh, lang)}
              <br />
              {i.stages.map((x) => stageLabel(x, lang)).join(", ")}
              {typeof i.responseRatePct === "number" && (
                <>
                  <br />
                  {f(iv.replies, { n: i.responseRatePct })}
                </>
              )}
            </p>
          </li>
        ))}
        {list.length === 0 && (
          <li className="py-8 text-center">
            <Art name="empty" className="mx-auto mb-2 w-[220px]" />
            <p className="text-lg">{iv.empty}</p>
            <p className="mt-1 text-slate">
              {before}<Link href="/signin" className="underline text-neel-500">{iv.listFree}</Link>{after}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
