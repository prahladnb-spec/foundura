import type { Metadata } from "next";
import { SectorGuidePage } from "@/components/sector-guide";
import { isLang } from "@/i18n/config";
import { AGRITECH } from "@/sectors/agritech";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("agritech", isLang(lang) ? lang : "en");
}

/** The agritech and food sector guide. */
export default async function AgritechGuide({ params }: { params: Params }) {
  const { lang } = await params;
  return <SectorGuidePage guide={AGRITECH} lang={isLang(lang) ? lang : "en"} />;
}
