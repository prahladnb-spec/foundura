import { alternates } from "@/seo";
import type { Metadata } from "next";
import { PrivacyEn } from "@/components/legal/privacy-en";
import { PrivacyHi } from "@/components/legal/privacy-hi";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { LEGAL_VERSION, legalDetails } from "@/lib/legal";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang).legalPages;
  return { title: t.privacyTitle, description: t.privacyDescription, alternates: alternates("/privacy", lang) };
}

// Company and grievance details come from the server's settings at request time.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Params }) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const legal = legalDetails();
  if (lang === "hi") return <PrivacyHi legal={legal} version={LEGAL_VERSION} />;
  if (lang === "en") return <PrivacyEn legal={legal} version={LEGAL_VERSION} />;
  // Other languages: a translated note, then the English text, which is the one that applies.
  return (
    <>
      <p className="mx-auto mt-8 max-w-3xl rounded-md bg-neel-50 px-5 py-3 text-neel-700">{getDict(lang).legalPages.englishOnly}</p>
      <div lang="en" dir="ltr">
        <PrivacyEn legal={legal} version={LEGAL_VERSION} />
      </div>
    </>
  );
}
