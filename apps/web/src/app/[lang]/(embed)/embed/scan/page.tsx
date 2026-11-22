import type { Metadata } from "next";
import { EmbedResizer } from "@/components/embed-resizer";
import { ScanForm } from "@/components/scan-form";
import { getDict } from "@/i18n";
import { isLang, lp } from "@/i18n/config";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").scan.title, robots: { index: false } };
}

/**
 * Chrome-free Scheme Scan for partner sites (state missions, incubators, colleges, banks).
 * Framing is allowed only on /embed/* (see next.config.ts). No cookies are set and nothing is stored.
 */
export default async function EmbedScan({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | undefined>> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const [before, after] = t.scan.poweredBy.split("{link}");
  return (
    <main className="px-4 py-5 bg-paper">
      <EmbedResizer />
      <h1 className="display text-4xl">{t.scan.embedTitle}</h1>
      <p className="mt-2 mb-6 text-neel-700">{t.scan.embedLead}</p>
      <ScanForm initial={{ state: sp.state, entityType: sp.entityType, stage: sp.stage }} embedded />
      <p className="mt-6 text-[0.85rem] text-slate">
        {before}
        <a href={`${lp(lang, "/")}?utm_source=embed`} target="_blank" rel="noopener" className="underline">
          Foundura
        </a>
        {after}
      </p>
    </main>
  );
}
