import type { Metadata } from "next";
import { NewsletterAction } from "@/components/newsletter-action";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { legalDetails } from "@/lib/legal";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").newsletter.confirmTitle, robots: { index: false } };
}

/** Where the link in the confirmation email lands. */
export default async function NewsletterConfirmPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const n = getDict(isLang(p.lang) ? p.lang : "en").newsletter;
  const s = typeof sp.s === "string" ? sp.s : "";
  const t = typeof sp.t === "string" ? sp.t : "";
  return (
    <div className="mx-auto max-w-lg px-5 py-14">
      <h1 className="display text-[2.8rem] leading-none">{n.confirmTitle}</h1>
      {s && t ? (
        <>
          <p className="mt-4 text-lg text-neel-700">{n.confirmLead}</p>
          <NewsletterAction action="confirm" s={s} t={t} support={legalDetails().supportEmail ?? "support@foundura.org"} />
        </>
      ) : (
        <p className="mt-4 text-lg text-neel-700">{n.incomplete}</p>
      )}
    </div>
  );
}
