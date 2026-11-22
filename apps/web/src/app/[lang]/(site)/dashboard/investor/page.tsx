import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InvestorDashboard } from "@/components/investor-dashboard";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import { isLang, lp } from "@/i18n/config";
import type { InvestorOwn } from "@/lib/types";

export const metadata: Metadata = { title: "Investor dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function InvestorDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const token = await getToken();
  if (!token) redirect(lp(lang, "/signin"));
  let me: { user: { email: string }; investor: InvestorOwn | null };
  try {
    me = await api("/me", { token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(lp(lang, "/signin"));
    throw e;
  }
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <InvestorDashboard email={me.user.email} investor={me.investor} />
    </div>
  );
}
