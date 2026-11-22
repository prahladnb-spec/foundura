"use client";

import Link from "@/components/locale-link";
import { useCallback, useEffect, useState } from "react";
import { MIN_MATCH_FOR_INTRO, MIN_READINESS_FOR_INTRO } from "@foundura/shared/constants";
import { f, lab, matchText } from "@/i18n";
import { useT } from "@/i18n/client";
import { chequeRange, investorTypeLabel } from "@/lib/labels";
import type { InvestorPublic, MatchResult, Readiness, ReadinessItem, SentIntro } from "@/lib/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api/me/${path}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Request failed");
  return data;
}

/** Readiness tips come from the shared scorer in English; show them in the visitor's language by key. */
function useReadinessText() {
  const { t } = useT();
  const map = t.labels.readiness as Record<string, { label: string; fix: string; fix2?: string }>;
  return (i: ReadinessItem) => {
    const x = map[i.key];
    if (!x) return { label: i.label, fix: i.fix };
    // Traction has two possible tips: no prototype yet, or prototype without revenue.
    const fix = i.key === "traction" && i.earned > 0 && x.fix2 ? x.fix2 : x.fix;
    return { label: x.label, fix: i.fix ? fix : null };
  };
}

function ReadinessCard({ r }: { r: Readiness }) {
  const { lang, t } = useT();
  const fi = t.founderInv;
  const text = useReadinessText();
  const todo = r.items.filter((i) => i.fix).sort((a, b) => b.points - b.earned - (a.points - a.earned));
  return (
    <div className="rounded-xl border-2 border-neel-900 bg-white p-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="display text-3xl">{fi.readiness}</h3>
        <p className="text-lg">
          <strong className="display text-4xl">{r.score}</strong> / 100, {String(lab(t.labels.band, r.band)).toLowerCase()}
        </p>
      </div>
      <div className="mt-3 h-3 rounded-full bg-neel-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score} aria-label={fi.readinessAria}>
        <div className={`h-3 rounded-full ${r.score >= 75 ? "bg-leaf" : "bg-marigold"}`} style={{ width: `${r.score}%` }} />
      </div>
      <p className="mt-2 text-[0.92rem] text-slate">
        {f(fi.readinessNote, { n: MIN_READINESS_FOR_INTRO })}
      </p>
      {todo.length > 0 ? (
        <>
          <p className="mt-5 font-semibold">{fi.raise}</p>
          <ul className="mt-2 divide-y divide-rule">
            {todo.map((i) => (
              <li key={i.key} className="grid grid-cols-[3.5rem_1fr] gap-3 py-2.5">
                <span className="font-semibold text-marigold-ink">+{i.points - i.earned}</span>
                <span>
                  <span className="font-semibold">{text(i).label}{lang === "hi" ? "।" : "."}</span> {text(i).fix}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 font-semibold text-leaf">{fi.complete}</p>
      )}
    </div>
  );
}

type MatchRow = { investor: InvestorPublic; match: MatchResult; introStatus: string | null };

function IntroForm({ startupId, investor, onSent }: { startupId: string; investor: InvestorPublic; onSent: () => void }) {
  const { t } = useT();
  const fi = t.founderInv;
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/me/startups/${startupId}/intros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investorId: investor.id, message }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data?.issues?.[0]?.message ?? data?.message ?? fi.sendFailed);
    onSent();
  }
  return (
    <form onSubmit={send} className="mt-3 grid gap-2">
      <label htmlFor={`msg-${investor.id}`} className="font-semibold">{f(fi.messageTo, { name: investor.firm ?? investor.name })}</label>
      <textarea
        id={`msg-${investor.id}`}
        rows={4}
        minLength={40}
        maxLength={800}
        required
        className="rounded-md border border-rule bg-white px-3 py-2"
        placeholder={fi.messagePh}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="text-[0.88rem] text-slate">
        {f(fi.messageNote, { n: message.length })}
      </p>
      <div className="flex items-center gap-3">
        <button disabled={busy || message.length < 40} className="rounded-md bg-marigold px-4 py-2 font-semibold text-neel-950 disabled:opacity-60">
          {busy ? fi.sending : fi.send}
        </button>
        {error && <p role="alert" className="text-marigold-ink">{error}</p>}
      </div>
    </form>
  );
}

export function FounderInvestors({ startupId, version }: { startupId: string; version: number }) {
  const { lang, t } = useT();
  const fi = t.founderInv;
  const status = (k: string) => String(lab(t.labels.introStatus, k));
  const [r, setR] = useState<Readiness | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [sent, setSent] = useState<SentIntro[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [rr, mm, ii] = await Promise.all([
        get<Readiness>(`startups/${startupId}/readiness`),
        get<MatchRow[]>(`startups/${startupId}/investor-matches`),
        get<{ sent: SentIntro[] }>("intros"),
      ]);
      setR(rr);
      setMatches(mm);
      setSent(ii.sent);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [startupId]);

  useEffect(() => {
    load();
  }, [load, version]);

  if (error) return <p role="alert" className="mt-10 text-marigold-ink">{error}</p>;
  if (!r) return null;
  const canRequest = r.score >= MIN_READINESS_FOR_INTRO;

  return (
    <section aria-labelledby="inv-h" className="mt-16 border-t-2 border-neel-900 pt-8">
      <h2 id="inv-h" className="display text-4xl">{fi.title}</h2>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <ReadinessCard r={r} />
        <div>
          <h3 className="display text-3xl">{fi.bestMatches}</h3>
          {matches.length === 0 && (
            <p className="mt-3 text-neel-700">
              {fi.noMatches.split("{link}")[0]}<Link href="/investors" className="underline">{fi.browse}</Link>{fi.noMatches.split("{link}")[1]}
            </p>
          )}
          <ul className="mt-3 divide-y divide-rule">
            {matches.slice(0, 8).map(({ investor: i, match: m, introStatus }) => {
              const eligible = canRequest && m.score >= MIN_MATCH_FOR_INTRO && !introStatus;
              return (
                <li key={i.id} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link href={`/investors/${i.slug}`} className="text-lg font-semibold hover:underline">{i.firm ?? i.name}</Link>
                    <span className={`font-semibold ${m.score >= 70 ? "text-leaf" : m.score >= MIN_MATCH_FOR_INTRO ? "text-marigold-ink" : "text-slate"}`}>
                      {f(fi.match, { n: m.score })}
                    </span>
                  </div>
                  <p className="text-[0.92rem] text-slate">
                    {investorTypeLabel(i.type, lang)}; {chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh, lang)}
                    {i.verified ? fi.verified : ""}
                  </p>
                  <p className="mt-1 text-[0.95rem]">
                    {m.reasons.map((x) => matchText(t, x)).join(lang === "hi" ? "। " : ". ")}
                    {m.gaps.length > 0 && (
                      <span className="text-slate">
                        {m.reasons.length ? (lang === "hi" ? "। " : ". ") : ""}
                        {m.gaps.map((x) => matchText(t, x)).join(lang === "hi" ? "। " : ". ")}
                      </span>
                    )}
                    {lang === "hi" ? "।" : "."}
                  </p>
                  {introStatus ? (
                    <p className="mt-2 text-[0.92rem] font-semibold text-neel-700">{f(fi.intro, { status: status(introStatus).toLowerCase() })}</p>
                  ) : eligible ? (
                    open === i.id ? (
                      <IntroForm startupId={startupId} investor={i} onSent={() => { setOpen(null); load(); }} />
                    ) : (
                      <button onClick={() => setOpen(i.id)} className="mt-2 rounded-md border-2 border-neel-900 px-3 py-1.5 font-semibold">
                        {fi.request}
                      </button>
                    )
                  ) : (
                    <p className="mt-2 text-[0.88rem] text-slate">
                      {!canRequest ? f(fi.opensAt, { n: MIN_READINESS_FOR_INTRO }) : fi.tooLow}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {sent.length > 0 && (
        <div className="mt-10">
          <h3 className="display text-3xl">{fi.sent}</h3>
          <ul className="mt-3 divide-y divide-rule">
            {sent.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{x.investor.firm ?? x.investor.name}</span>
                  <span className="block text-[0.92rem] text-slate">{status(x.status)}</span>
                </span>
                {x.contactEmail ? (
                  <a href={`mailto:${x.contactEmail}`} className="font-semibold text-leaf underline">{x.contactEmail}</a>
                ) : x.status === "pending" ? (
                  <button
                    className="underline text-neel-500"
                    onClick={async () => {
                      await fetch(`/api/me/intros/${x.id}/withdraw`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
                      load();
                    }}
                  >
                    {fi.withdraw}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
