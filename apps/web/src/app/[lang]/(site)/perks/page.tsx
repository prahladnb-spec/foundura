import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import { CHECKED_ON, GATHERED_ON, PERK_GROUPS, PERKS, type Perk } from "@/perks/directory";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("perks", isLang(lang) ? lang : "en");
}

/** Free credits, discounts and DPIIT benefits. Official links only; no deals, no tracking. */
export default async function PerksPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "en";
  const t = getDict(lang);
  const d = t.perks;
  // Entries are written in English; other languages show them marked as English.
  const en = lang === "en" ? undefined : "en";
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  const reportHref = (p: Perk) => `mailto:${support}?subject=${encodeURIComponent(`Perks: ${p.name}`)}`;
  const [scanA, scanB] = d.dpiit.split("{link}");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="perks">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
        <p className="mt-4 max-w-[62ch] rounded-lg border border-rule bg-white px-4 py-3 text-[0.95rem] text-neel-700">
          {CHECKED_ON ? f(d.checked, { date: fmtDate(CHECKED_ON, true, lang) }) : f(d.unchecked, { date: fmtDate(GATHERED_ON, true, lang) })}
        </p>
      </PageIntro>

      <nav aria-label={d.jump} className="mt-8 flex flex-wrap gap-2">
        {PERK_GROUPS.map((g) => (
          <a key={g} href={`#${g}`} className="rounded-full border border-neel-900 px-4 py-1.5 font-semibold no-underline">
            {d.groups[g]} <span className="font-normal text-slate">{PERKS.filter((p) => p.group === g).length}</span>
          </a>
        ))}
      </nav>

      {PERK_GROUPS.map((g) => (
        <section key={g} id={g} aria-labelledby={`${g}-h`} className="mt-12 scroll-mt-24">
          <h2 id={`${g}-h`} className="display text-4xl">{d.groups[g]}</h2>
          {g === "government" && (
            <p className="mt-2 max-w-[62ch] text-neel-700">
              {scanA}
              <Link href="/scan" className="text-neel-500 underline">{d.dpiitLink}</Link>
              {scanB}
            </p>
          )}
          <ul className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-2">
            {PERKS.filter((p) => p.group === g).map((p) => (
              <li key={p.id} id={`perk-${p.id}`} className="scroll-mt-24 border-t-2 border-neel-900 pt-3 target:bg-marigold-50">
                <h3 lang={en} className="font-display text-xl font-bold leading-tight">{p.name}</h3>
                <p lang={en} className="text-[0.92rem] text-slate">{p.by}</p>
                <p lang={en} className="mt-2">{p.offer}</p>
                <p className="mt-2 text-[0.95rem]">
                  <span className="font-semibold">{d.who}:</span> <span lang={en}>{p.who}</span>
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-neel-900 underline decoration-marigold decoration-2 underline-offset-4">
                      {d.visit}
                      <span className="sr-only" lang={en}>: {p.name}</span>
                    </a>
                  )}
                  {p.scheme && (
                    <Link href={`/schemes/${p.scheme}`} className="text-neel-500 underline">{t.funding.schemeLink}</Link>
                  )}
                  <a href={reportHref(p)} className="text-slate underline">
                    {t.funding.report}
                    <span className="sr-only" lang={en}>: {p.name}</span>
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="promise-h" className="mt-14 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
        <h2 id="promise-h" className="display text-3xl">{d.promiseTitle}</h2>
        <p className="mt-3 max-w-[65ch] text-neel-100">{d.promise}</p>
      </section>
    </div>
  );
}
