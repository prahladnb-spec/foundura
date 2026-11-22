import { schemeHelp } from "@/documents/scheme-help";
import { pageMetadata } from "@/seo";
import { PageIntro } from "@/components/art";
import type { Metadata } from "next";
import { ScanForm } from "@/components/scan-form";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("scan", isLang(lang) ? lang : "en");
}

export default async function ScanPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  const t = getDict(isLang(lang) ? lang : "en");
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <div className="no-print">
      <PageIntro art="scan">
        <h1 className="display text-6xl md:text-7xl">{t.scan.title}</h1>
        <p className="mt-3 mb-10 max-w-[60ch] text-lg text-neel-700">{t.scan.lead}</p>
      </PageIntro>
      </div>
      <ScanForm initial={{ state: sp.state, entityType: sp.entityType, stage: sp.stage, sector: sp.sector }} help={schemeHelp(isLang(lang) ? lang : "en")} />
    </div>
  );
}
