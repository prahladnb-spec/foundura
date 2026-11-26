"use client";

import { useEffect, useState } from "react";
import { SHARE_DAYS } from "@foundura/shared/constants";
import { f } from "@/i18n/util";
import { useT } from "@/i18n/client";
import { INTL_LOCALE, lp } from "@/i18n/config";
import type { ShareState } from "@/lib/types";

/**
 * A private link to the founder's profile for one incubator or investor. The founder picks what it
 * includes and how long it works, and can switch it off. The server keeps only a hash of the key,
 * so the full link is shown once, right after it's made.
 */
export function ShareLink({ startupId }: { startupId: string }) {
  const { lang, t } = useT();
  const s = t.share;
  const [active, setActive] = useState<ShareState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showReadiness, setShowReadiness] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [days, setDays] = useState<(typeof SHARE_DAYS)[number]>(30);
  const [url, setUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const base = `/api/me/startups/${startupId}/share`;

  useEffect(() => {
    fetch(base, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { active: null }))
      .then((d: { active: ShareState | null }) => setActive(d.active))
      .catch(() => setActive(null))
      .finally(() => setLoaded(true));
  }, [base]);

  const date = (iso: string) => new Date(iso).toLocaleDateString(INTL_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });

  async function make() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ showReadiness, showProgress, days }) });
      if (!res.ok) throw new Error();
      const d: { token: string; active: ShareState } = await res.json();
      setActive(d.active);
      setUrl(`${location.origin}${lp(lang, `/shared/${d.token}`)}`);
    } catch {
      setMsg({ ok: false, text: s.failed });
    } finally {
      setBusy(false);
    }
  }

  async function off() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(base, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setActive(null);
      setUrl(null);
      setMsg({ ok: true, text: s.offDone });
    } catch {
      setMsg({ ok: false, text: s.failed });
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMsg({ ok: true, text: s.copied });
    } catch {
      /* the link is selectable in the box */
    }
  }

  return (
    <section aria-labelledby="share-h" className="mt-16 border-t-2 border-neel-900 pt-8">
      <h2 id="share-h" className="display text-4xl">{s.title}</h2>
      <p className="mt-2 max-w-[62ch] text-neel-700">{s.lead}</p>

      {url && (
        <div className="mt-6 rounded-xl border-2 border-leaf bg-leaf-50 p-5">
          <label htmlFor="share-url" className="font-semibold">{s.yourLink}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input id="share-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} dir="ltr" className="min-w-0 flex-1 rounded-md border border-rule bg-white px-3 py-2.5 font-mono text-[0.9rem]" />
            <button type="button" onClick={copy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper">{s.copy}</button>
          </div>
          <p className="mt-2 text-[0.92rem] text-neel-700">{s.once}</p>
        </div>
      )}

      {loaded && (
        <p className="mt-6">{active ? f(s.active, { date: date(active.expiresAt) }) : s.none}</p>
      )}

      <div className="mt-4 grid gap-3">
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={showReadiness} onChange={(e) => setShowReadiness(e.target.checked)} className="h-5 w-5 accent-neel-900" />
          {s.showReadiness}
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={showProgress} onChange={(e) => setShowProgress(e.target.checked)} className="h-5 w-5 accent-neel-900" />
          {s.showProgress}
        </label>
        <label className="flex flex-wrap items-center gap-3">
          <span>{s.expires}</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value) as (typeof SHARE_DAYS)[number])} className="rounded-md border border-rule bg-white px-3 py-2">
            {SHARE_DAYS.map((n) => (
              <option key={n} value={n}>{f(s.days, { n })}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 max-w-[62ch] text-[0.92rem] text-slate">{s.never}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={make} disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">
          {active ? s.replace : s.create}
        </button>
        {active && (
          <button type="button" onClick={off} disabled={busy} className="rounded-md border-2 border-neel-900 px-5 py-2 font-semibold disabled:opacity-60">
            {s.off}
          </button>
        )}
      </div>
      <p role="status" className={`mt-3 min-h-6 ${msg?.ok ? "text-leaf" : "text-marigold-ink"}`}>{msg?.text}</p>
    </section>
  );
}
