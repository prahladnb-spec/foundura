import type { Metadata } from "next";
import { FounderGuidePage } from "@/components/founder-guide";
import { isLang } from "@/i18n/config";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("onlineSelling", isLang(lang) ? lang : "en");
}

export default async function Page({ params }: { params: Params }) {
  const { lang } = await params;
  return <FounderGuidePage guide="onlineSelling" lang={isLang(lang) ? lang : "en"} />;
}
