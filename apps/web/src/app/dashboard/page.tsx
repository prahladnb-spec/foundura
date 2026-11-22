import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ConsentState, Startup } from "@/lib/types";

export const metadata: Metadata = { title: "My startup", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/signin");
  let me: { user: { id: string; email: string }; startups: Startup[]; consents: ConsentState[] };
  try {
    me = await api("/me", { token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/signin");
    throw e;
  }
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <Dashboard email={me.user.email} startup={me.startups[0] ?? null} consents={me.consents} />
    </div>
  );
}
