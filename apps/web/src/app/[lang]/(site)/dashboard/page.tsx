import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import { isLang, lp } from "@/i18n/config";
import { getDict } from "@/i18n";
import type { ConsentState, Startup } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").dashboard.metaTitle, robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const token = await getToken();
  if (!token) redirect(lp(lang, "/signin"));
  let me: { user: { id: string; email: string }; isAdmin: boolean; startups: Startup[]; consents: ConsentState[] };
  try {
    me = await api("/me", { token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(lp(lang, "/signin"));
    throw e;
  }
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <Dashboard email={me.user.email} isAdmin={me.isAdmin} startup={me.startups[0] ?? null} consents={me.consents} />
    </div>
  );
}
