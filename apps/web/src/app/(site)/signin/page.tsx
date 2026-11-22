import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/signin-form";
import { getToken } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

/** Only same-site paths, so the sign-in page can't be used to bounce people elsewhere. */
function safeNext(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && /^\/(?!\/)[\w\-/]*$/.test(s) ? s : "/dashboard";
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = safeNext((await searchParams).next);
  if (await getToken()) redirect(next);
  return (
    <div className="mx-auto max-w-lg px-5 pt-12">
      <h1 className="display text-6xl">Sign in</h1>
      <p className="mt-3 text-lg text-neel-700">
        We&apos;ll email you a 6-digit code. No password needed. New here? This creates your free account.
      </p>
      <SignInForm next={next} />
    </div>
  );
}
