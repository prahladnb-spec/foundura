import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { InvestorUpdateBuilder } from "@/components/investor-update-builder";
import { getDict } from "@/i18n";
import { isLang, type Lang } from "@/i18n/config";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("investorUpdate", isLang(lang) ? lang : "en");
}

/** A form that writes the monthly investor update. Runs in the browser; nothing is saved or sent. */
export default async function InvestorUpdatePage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "en";
  const u = getDict(lang).update;
  const [a, b] = u.template.split("{link}");
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <PageIntro art="letter">
        <h1 className="display text-6xl md:text-7xl">{u.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{u.lead}</p>
        <p className="mt-3 max-w-[62ch] text-neel-700">
          {a}
          <Link href="/documents/investor-update" className="text-neel-500 underline">{u.templateLink}</Link>
          {b}
        </p>
      </PageIntro>
      <InvestorUpdateBuilder />
    </div>
  );
}
