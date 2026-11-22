import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/signin-form";
import { getToken } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await getToken()) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-lg px-5 pt-12">
      <h1 className="display text-6xl">Sign in</h1>
      <p className="mt-3 text-lg text-neel-700">
        We&apos;ll email you a 6-digit code. No password needed. New here? This creates your free account.
      </p>
      <SignInForm />
    </div>
  );
}
