import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { Icon } from "@/components/icons";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { legalDetails } from "@/lib/legal";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("contact", isLang(lang) ? lang : "en");
}

function Mail({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} dir="ltr" className="font-semibold underline">
      {email}
    </a>
  );
}

/** Who to write to. Messages go by email, so the site itself stores nothing. */
export default async function ContactPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en";
  const t = getDict(lang);
  const c = t.contact;
  const legal = legalDetails();
  const support = legal.supportEmail ?? "support@foundura.org";
  const [wBefore, wAfter] = c.write.split("{email}");
  const [pBefore, pAfter] = c.privacy.split("{link}");
  const [gBefore, gAfter] = c.grievancePending.split("{link}");
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="letter">
        <h1 className="display text-6xl md:text-7xl">{c.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{c.lead}</p>
      </PageIntro>

      <ul className="mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3">
        {c.topics.map((x) => (
          <li key={x.t} className="border-t-2 border-neel-900 pt-3">
            <h2 className="text-lg font-semibold">{x.t}</h2>
            <p className="mt-1 text-neel-700">{x.d}</p>
            <p className="mt-2">
              {wBefore}
              <Mail email={support} />
              {wAfter}
            </p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="privacy-h" className="mt-12 max-w-[65ch]">
        <h2 id="privacy-h" className="display text-3xl">{c.privacyTitle}</h2>
        <p className="mt-3 text-neel-700">
          {pBefore}
          <Link href="/dashboard" className="underline">{t.unsub.myStartup}</Link>
          {pAfter}
        </p>
        <p className="mt-2">
          {legal.grievanceName && legal.grievanceEmail ? (
            <>
              {c.grievance.replace("{name}", legal.grievanceName)}, <Mail email={legal.grievanceEmail} />
            </>
          ) : (
            <>
              {gBefore}
              <Link href="/privacy" className="underline">{t.chrome.footer.privacy}</Link>
              {gAfter}
            </>
          )}
        </p>
      </section>

      <section aria-labelledby="scam-h" className="mt-12 flex max-w-[70ch] gap-4 rounded-xl border-2 border-tape bg-white p-5">
        <Icon icon={ShieldAlert} className="mt-1 h-7 w-7 shrink-0 text-tape" />
        <div>
          <h2 id="scam-h" className="display text-2xl">{c.scamTitle}</h2>
          <p className="mt-2 text-neel-700">{c.scam}</p>
        </div>
      </section>

      <p className="mt-8 max-w-[65ch] text-neel-700">{c.limits}</p>
    </div>
  );
}
