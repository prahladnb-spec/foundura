import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/signin-form";
import { getDict } from "@/i18n";
import { isLang, lp } from "@/i18n/config";
import { getToken } from "@/lib/session";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").signin.title };
}

/** Only same-site paths, so the sign-in page can't be used to bounce people elsewhere. */
function safeNext(v: string | string[] | undefined, fallback: string): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && /^\/(?!\/)[\w\-/]*$/.test(s) ? s : fallback;
}

export default async function SignInPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const next = safeNext(sp.next, lp(lang, "/dashboard"));
  if (await getToken()) redirect(next);
  return (
    <div className="mx-auto max-w-lg px-5 pt-12">
      <h1 className="display text-6xl">{t.signin.title}</h1>
      <p className="mt-3 text-lg text-neel-700">{t.signin.lead}</p>
      <SignInForm next={next} />
    </div>
  );
}
