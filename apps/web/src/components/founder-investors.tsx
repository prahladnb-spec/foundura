"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MIN_MATCH_FOR_INTRO, MIN_READINESS_FOR_INTRO } from "@foundura/shared";
import { chequeRange, investorTypeLabel } from "@/lib/labels";
import type { InvestorPublic, MatchResult, Readiness, SentIntro } from "@/lib/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api/me/${path}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Request failed");
  return data;
}

const BAND: Record<Readiness["band"], string> = {
  getting_started: "Getting started",
  almost_ready: "Almost ready",
  investor_ready: "Investor ready",
};

const STATUS: Record<string, string> = {
  pending: "Waiting for a reply",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

function ReadinessCard({ r }: { r: Readiness }) {
  const todo = r.items.filter((i) => i.fix).sort((a, b) => b.points - b.earned - (a.points - a.earned));
  return (
    <div className="rounded-xl border-2 border-neel-900 bg-white p-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="display text-3xl">Readiness score</h3>
        <p className="text-lg">
          <strong className="display text-4xl">{r.score}</strong> / 100, {BAND[r.band].toLowerCase()}
        </p>
      </div>
      <div className="mt-3 h-3 rounded-full bg-neel-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score} aria-label="Readiness score">
        <div className={`h-3 rounded-full ${r.score >= 75 ? "bg-leaf" : "bg-marigold"}`} style={{ width: `${r.score}%` }} />
      </div>
      <p className="mt-2 text-[0.92rem] text-slate">
        Measures how complete your profile is for investors, not how good your idea is. Intros open at {MIN_READINESS_FOR_INTRO}.
      </p>
      {todo.length > 0 ? (
        <>
          <p className="mt-5 font-semibold">Raise your score</p>
          <ul className="mt-2 divide-y divide-rule">
            {todo.map((i) => (
              <li key={i.key} className="grid grid-cols-[3.5rem_1fr] gap-3 py-2.5">
                <span className="font-semibold text-marigold-ink">+{i.points - i.earned}</span>
                <span>
                  <span className="font-semibold">{i.label}.</span> {i.fix}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 font-semibold text-leaf">Your profile is complete.</p>
      )}
    </div>
  );
}

type MatchRow = { investor: InvestorPublic; match: MatchResult; introStatus: string | null };

function IntroForm({ startupId, investor, onSent }: { startupId: string; investor: InvestorPublic; onSent: () => void }) {
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
    if (!res.ok) return setError(data?.issues?.[0]?.message ?? data?.message ?? "Could not send the request.");
    onSent();
  }
  return (
    <form onSubmit={send} className="mt-3 grid gap-2">
      <label htmlFor={`msg-${investor.id}`} className="font-semibold">Message to {investor.firm ?? investor.name}</label>
      <textarea
        id={`msg-${investor.id}`}
        rows={4}
        minLength={40}
        maxLength={800}
        required
        className="rounded-md border border-rule bg-white px-3 py-2"
        placeholder="What you do, your traction, and why this investor is a fit."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="text-[0.88rem] text-slate">
        They will see your public profile, deck link and raise amount. Your email is shared only if they accept. {message.length}/800
      </p>
      <div className="flex items-center gap-3">
        <button disabled={busy || message.length < 40} className="rounded-md bg-marigold px-4 py-2 font-semibold text-neel-950 disabled:opacity-60">
          {busy ? "Sending…" : "Send intro request"}
        </button>
        {error && <p role="alert" className="text-marigold-ink">{error}</p>}
      </div>
    </form>
  );
}

export function FounderInvestors({ startupId, version }: { startupId: string; version: number }) {
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
      <h2 id="inv-h" className="display text-4xl">Investors</h2>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <ReadinessCard r={r} />
        <div>
          <h3 className="display text-3xl">Your best matches</h3>
          {matches.length === 0 && (
            <p className="mt-3 text-neel-700">
              No investors listed yet who fit. We&apos;ll show matches here as investors join. <Link href="/investors" className="underline">Browse all investors</Link>.
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
                      {m.score}% match
                    </span>
                  </div>
                  <p className="text-[0.92rem] text-slate">
                    {investorTypeLabel(i.type)}; {chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh)}
                    {i.verified ? "; verified" : ""}
                  </p>
                  <p className="mt-1 text-[0.95rem]">
                    {m.reasons.join(". ")}
                    {m.gaps.length > 0 && <span className="text-slate">{m.reasons.length ? ". " : ""}{m.gaps.join(". ")}</span>}.
                  </p>
                  {introStatus ? (
                    <p className="mt-2 text-[0.92rem] font-semibold text-neel-700">Intro: {STATUS[introStatus]?.toLowerCase()}</p>
                  ) : eligible ? (
                    open === i.id ? (
                      <IntroForm startupId={startupId} investor={i} onSent={() => { setOpen(null); load(); }} />
                    ) : (
                      <button onClick={() => setOpen(i.id)} className="mt-2 rounded-md border-2 border-neel-900 px-3 py-1.5 font-semibold">
                        Request intro
                      </button>
                    )
                  ) : (
                    <p className="mt-2 text-[0.88rem] text-slate">
                      {!canRequest ? `Intros open at a readiness score of ${MIN_READINESS_FOR_INTRO}.` : "Match too low for an intro."}
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
          <h3 className="display text-3xl">Your intro requests</h3>
          <ul className="mt-3 divide-y divide-rule">
            {sent.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{x.investor.firm ?? x.investor.name}</span>
                  <span className="block text-[0.92rem] text-slate">{STATUS[x.status]}</span>
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
                    Withdraw
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
