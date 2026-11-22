"use client";

import Link from "@/components/locale-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONSENT_PURPOSES } from "@foundura/shared";
import { useT } from "@/i18n/client";

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";

export function SignInForm({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const { t } = useT();
  const si = t.signin;
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [consents, setConsents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.issues?.[0]?.message ?? data?.message ?? si.failed);
    return data;
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await post("/api/auth/request", { email });
      setDevCode(data.devCode ?? null);
      setStep("code");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/verify", { email, code, consents });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="mt-8 grid gap-4">
        <label className="block">
          <span className="block font-semibold mb-1">{si.email}</span>
          <input type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button disabled={busy} className="justify-self-start rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 disabled:opacity-60">
          {busy ? si.sending : si.send}
        </button>
        {error && <p role="alert" className="text-marigold-ink">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="mt-8 grid gap-5">
      <p>
        {si.sentTo.split("{email}")[0]}<strong>{email}</strong>{si.sentTo.split("{email}")[1]}{" "}
        <button type="button" className="underline text-neel-500" onClick={() => setStep("email")}>{si.change}</button>
      </p>
      {devCode && (
        <p className="rounded-md border border-dashed border-neel-500 bg-neel-50 px-4 py-3 text-[0.95rem]">
          {si.devCode.split("{code}")[0]}<strong className="tracking-widest">{devCode}</strong>{si.devCode.split("{code}")[1]}
        </p>
      )}
      <label className="block">
        <span className="block font-semibold mb-1">{si.code}</span>
        <input inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code" className={`${field} tracking-[0.4em] text-xl`} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      </label>
      <fieldset className="grid gap-3">
        <legend className="font-semibold mb-1">{si.choices}</legend>
        {CONSENT_PURPOSES.map((p) => (
          <label key={p.value} className="flex gap-3 items-start">
            <input
              type="checkbox"
              className="mt-1.5 h-4 w-4 accent-neel-900"
              checked={consents.includes(p.value)}
              onChange={(e) => setConsents((c) => (e.target.checked ? [...c, p.value] : c.filter((x) => x !== p.value)))}
            />
            <span>
              <span className="font-semibold">{t.labels.consent[p.value].label}{p.required ? si.requiredNew : ""}</span>
              <span className="block text-[0.92rem] text-slate">{t.labels.consent[p.value].description}</span>
            </span>
          </label>
        ))}
        <p className="text-[0.9rem] text-slate">
          {si.changeAny.split("{terms}")[0]}
          <Link href="/terms" className="underline">{si.termsLink}</Link>
          {si.changeAny.split("{terms}")[1].split("{privacy}")[0]}
          <Link href="/privacy" className="underline">{si.privacyLink}</Link>
          {si.changeAny.split("{privacy}")[1]}
        </p>
      </fieldset>
      <button disabled={busy || code.length !== 6} className="justify-self-start rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 disabled:opacity-60">
        {busy ? si.signingIn : si.submit}
      </button>
      {error && <p role="alert" className="text-marigold-ink">{error}</p>}
    </form>
  );
}
