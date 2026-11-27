import type { Metadata } from "next";
import { SectorGuidePage } from "@/components/sector-guide";
import { isLang } from "@/i18n/config";
import { MSME } from "@/sectors/msme";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("msme", isLang(lang) ? lang : "en");
}

/** The small businesses and MSME sector guide. */
export default async function MsmeGuide({ params }: { params: Params }) {
  const { lang } = await params;
  return <SectorGuidePage guide={MSME} lang={isLang(lang) ? lang : "en"} />;
}
