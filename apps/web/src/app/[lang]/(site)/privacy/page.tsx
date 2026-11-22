import type { Metadata } from "next";
import { PrivacyEn } from "@/components/legal/privacy-en";
import { PrivacyHi } from "@/components/legal/privacy-hi";
import { isLang } from "@/i18n/config";
import { LEGAL_VERSION, legalDetails } from "@/lib/legal";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return lang === "hi"
    ? { title: "गोपनीयता और आपका डेटा" }
    : { title: "Privacy and your data", description: "What Foundura collects, why, who sees it, and how to see, export, correct or delete your data." };
}

// Company and grievance details come from the server's settings at request time.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Params }) {
  const { lang } = await params;
  const legal = legalDetails();
  return isLang(lang) && lang === "hi" ? <PrivacyHi legal={legal} version={LEGAL_VERSION} /> : <PrivacyEn legal={legal} version={LEGAL_VERSION} />;
}
