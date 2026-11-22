import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Foundura editors" }, robots: { index: false } };
export const dynamic = "force-dynamic";

/** Sign-in link that brings the editor back to the console page they asked for. */
async function signInLink(): Promise<string> {
  const path = (await headers()).get("x-foundura-path") ?? "";
  const next = /^\/admin(\/[\w\-/]*)?$/.test(path) ? path : "/admin";
  return `/signin?next=${encodeURIComponent(next)}`;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect(await signInLink());
  try {
    await api("/admin/overview", { token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(await signInLink());
    if (e instanceof ApiError && e.status === 403)
      return (
        <div className="mx-auto max-w-2xl px-5 py-16">
          <h1 className="display text-[2.2rem]">This area is for editors</h1>
          <p className="mt-3 text-slate">
            Your account isn&apos;t on the editor list. If you should have access, ask the Foundura team to add your email.
          </p>
        </div>
      );
    throw e;
  }
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-16">
      <p className="text-[0.95rem] text-slate">Foundura editors</p>
      <AdminNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
