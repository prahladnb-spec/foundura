import { alternates } from "@/seo";
import type { Metadata } from "next";
import { TermsEn } from "@/components/legal/terms-en";
import { TermsHi } from "@/components/legal/terms-hi";
import { isLang } from "@/i18n/config";
import { LEGAL_VERSION, legalDetails } from "@/lib/legal";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  const l = lang === "hi" ? "hi" : "en";
  return {
    ...(l === "hi" ? { title: "उपयोग की शर्तें", description: "Foundura के इस्तेमाल के नियम: यह क्या है और क्या नहीं, आप किस पर सहमत होते हैं, और शिकायत कैसे करें।" } : { title: "Terms of use", description: "The rules for using Foundura: what it is and isn't, what you agree to, and how to raise a complaint." }),
    alternates: alternates("/terms", l),
  };
}

// Company and grievance details come from the server's settings at request time.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Params }) {
  const { lang } = await params;
  const legal = legalDetails();
  return isLang(lang) && lang === "hi" ? <TermsHi legal={legal} version={LEGAL_VERSION} /> : <TermsEn legal={legal} version={LEGAL_VERSION} />;
}
