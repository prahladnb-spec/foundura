import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { NewsletterAction } from "@/components/newsletter-action";
import { UnsubscribeButton } from "@/components/unsubscribe-button";
import { legalDetails } from "@/lib/legal";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").unsub.button, robots: { index: false } };
}

export default async function UnsubscribePage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const d = getDict(isLang(p.lang) ? p.lang : "en");
  const [before, after] = d.unsub.incomplete.split("{link}");
  const u = typeof sp.u === "string" ? sp.u : "";
  const s = typeof sp.s === "string" ? sp.s : "";
  const t = typeof sp.t === "string" ? sp.t : "";
  // Subscribers without an account (s=…): stopping deletes their address.
  if (s && t)
    return (
      <div className="mx-auto max-w-lg px-5 py-14">
        <h1 className="display text-[2.8rem] leading-none">{d.newsletter.stopTitle}</h1>
        <p className="mt-4 text-lg text-neel-700">{d.newsletter.stopLead}</p>
        <NewsletterAction action="stop" s={s} t={t} support={legalDetails().supportEmail ?? "support@foundura.org"} />
      </div>
    );
  return (
    <div className="mx-auto max-w-lg px-5 py-14">
      <h1 className="display text-[2.8rem] leading-none">{d.unsub.title}</h1>
      {u && t ? (
        <>
          <p className="mt-4 text-lg text-neel-700">{d.unsub.lead}</p>
          <UnsubscribeButton u={u} t={t} />
        </>
      ) : (
        <p className="mt-4 text-lg text-neel-700">
          {before}<Link href="/dashboard">{d.unsub.myStartup}</Link>{after}
        </p>
      )}
    </div>
  );
}
