"use client";

import Link from "@/components/locale-link";
import { useId, useState } from "react";
import { useT } from "@/i18n/client";

/**
 * Sign-up for the weekly email, in the footer of every page. Sends only the address and the
 * page language; the API emails a confirmation link (double opt-in) and stores nothing else.
 */
export function NewsletterForm() {
  const { t, lang } = useT();
  const n = t.newsletter;
  const id = useId();
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("busy");
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale: lang === "hi" ? "hi" : "en" }),
    }).catch(() => null);
    setState(res?.ok ? "sent" : "error");
  }

  const [before, after] = n.note.split("{link}");
  return (
    <section aria-labelledby={`${id}-h`} className="mt-6 max-w-md print:hidden">
      <h2 id={`${id}-h`} className="font-semibold text-paper">{n.title}</h2>
      <p className="mt-1 text-neel-100/80">
        {n.lead}
        {lang !== "en" && lang !== "hi" && <> {n.emailLang}</>}
      </p>
      {state === "sent" ? (
        <p role="status" className="mt-3 rounded-md bg-paper/10 px-3 py-2 text-paper">{n.sent}</p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
          <label htmlFor={`${id}-email`} className="sr-only">{n.label}</label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={n.label}
            dir="ltr"
            className="min-w-0 flex-1 rounded-md border border-neel-100/40 bg-paper px-3 py-2 text-neel-950 placeholder:text-slate"
          />
          <button type="submit" disabled={state === "busy"} className="rounded-md bg-marigold px-4 py-2 font-semibold text-neel-950 hover:bg-marigold-50 disabled:opacity-60">
            {state === "busy" ? n.busy : n.button}
          </button>
        </form>
      )}
      {state === "error" && <p role="alert" className="mt-2 text-marigold">{n.error}</p>}
      <p className="mt-2 text-[0.85rem] text-neel-100/70">
        {before}
        <Link href="/privacy" className="underline hover:text-paper">{t.chrome.footer.privacy}</Link>
        {after}
      </p>
    </section>
  );
}
