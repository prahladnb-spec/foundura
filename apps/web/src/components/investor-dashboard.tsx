"use client";

import { useCallback, useEffect, useState } from "react";
import { INDIAN_STATES, INVESTOR_TYPES, SECTORS, STAGES } from "@foundura/shared";
import { inrLakh, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import type { InvestorOwn, MatchResult, ReceivedIntro, StartupPublic } from "@/lib/types";

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";
const label = "block text-[0.95rem] font-semibold mb-1";

type Form = {
  name: string;
  firm: string;
  type: string;
  bio: string;
  website: string;
  sectors: string[];
  stages: string[];
  states: string[];
  chequeMinInrLakh: string;
  chequeMaxInrLakh: string;
  isListed: boolean;
};

const fromInvestor = (i: InvestorOwn | null): Form => ({
  name: i?.name ?? "",
  firm: i?.firm ?? "",
  type: i?.type ?? "angel",
  bio: i?.bio ?? "",
  website: i?.website ?? "",
  sectors: i?.sectors ?? [],
  stages: i?.stages ?? [],
  states: i?.states ?? [],
  chequeMinInrLakh: i?.chequeMinInrLakh?.toString() ?? "",
  chequeMaxInrLakh: i?.chequeMaxInrLakh?.toString() ?? "",
  isListed: i?.isListed ?? true,
});

function Chips({ options, value, onChange, max }: { options: readonly { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; max: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o.value) : value.length < max ? [...value, o.value] : value)}
            className={`rounded-full border px-3.5 py-1.5 text-[0.93rem] ${on ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`/api/me/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.issues?.[0] ? `${data.issues[0].path}: ${data.issues[0].message}` : data?.message ?? "Request failed");
  return data;
}


export function InvestorDashboard({ email, investor: initial }: { email: string; investor: InvestorOwn | null }) {
  const [investor, setInvestor] = useState(initial);
  const [f, setF] = useState<Form>(fromInvestor(initial));
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<{ startup: StartupPublic; match: MatchResult }[]>([]);
  const [inbox, setInbox] = useState<ReceivedIntro[]>([]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const load = useCallback(async () => {
    if (!investor) return;
    const [m, i] = await Promise.all([
      call<{ startup: StartupPublic; match: MatchResult }[]>("investor/matches"),
      call<{ received: ReceivedIntro[] }>("intros"),
    ]);
    setMatches(m);
    setInbox(i.received);
  }, [investor]);

  useEffect(() => {
    load().catch((e) => setMsg({ kind: "err", text: (e as Error).message }));
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const body = {
      ...f,
      firm: f.firm || undefined,
      bio: f.bio || undefined,
      chequeMinInrLakh: Number(f.chequeMinInrLakh || 0),
      chequeMaxInrLakh: Number(f.chequeMaxInrLakh || 0),
    };
    try {
      const saved = await call<InvestorOwn>("investor", investor ? "PATCH" : "POST", body);
      setInvestor(saved);
      setMsg({ kind: "ok", text: investor ? "Profile saved." : "Investor profile created." });
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function respond(id: string, accept: boolean) {
    try {
      await call(`intros/${id}/respond`, "POST", { accept });
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    }
  }

  const pending = inbox.filter((x) => x.status === "pending");
  const accepted = inbox.filter((x) => x.status === "accepted");
  const declined = inbox.filter((x) => x.status === "declined");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-6xl">{investor ? investor.firm ?? investor.name : "Investor profile"}</h1>
          <p className="mt-1 text-slate">Signed in as {email}</p>
          <nav aria-label="Dashboard" className="mt-4 flex gap-2">
            <a href="/dashboard" className="rounded-full border border-rule bg-white px-4 py-1.5 text-neel-900 no-underline">Startup</a>
            <span aria-current="page" className="rounded-full border border-neel-900 bg-neel-900 px-4 py-1.5 text-paper">Investor</span>
          </nav>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="underline text-neel-500">Sign out</button>
        </form>
      </div>

      {investor && (
        <section aria-labelledby="inbox-h" className="mt-10">
          <h2 id="inbox-h" className="display text-4xl">Intro requests</h2>
          {pending.length === 0 && <p className="mt-2 text-neel-700">No new requests. Founders who match your focus can request an intro.</p>}
          <ul className="mt-3 divide-y divide-rule">
            {pending.map((x) => (
              <li key={x.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xl font-semibold">{x.startup.name}</p>
                  <span className="font-semibold text-leaf">{x.matchScore}% match</span>
                </div>
                <p className="text-[0.92rem] text-slate">
                  {[x.startup.oneLiner, x.startup.sectors.map((x) => sectorLabel(x)).join(", "), stageLabel(x.startup.stage), stateLabel(x.startup.state)].filter(Boolean).join("; ")}
                </p>
                <blockquote className="mt-3 border-l-4 border-marigold pl-4 max-w-[68ch]">{x.message}</blockquote>
                <p className="mt-3 text-[0.95rem]">
                  {x.startup.raisingInrLakh ? <>Raising {inrLakh(x.startup.raisingInrLakh)}. </> : null}
                  {x.startup.deckUrl && <a href={x.startup.deckUrl} target="_blank" rel="noopener noreferrer" className="underline text-neel-500">Open pitch deck</a>}
                  {x.startup.website && <> <a href={x.startup.website} target="_blank" rel="noopener noreferrer" className="ml-3 underline text-neel-500">Website</a></>}
                </p>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => respond(x.id, true)} className="rounded-md bg-leaf px-4 py-2 font-semibold text-white">Accept and share contacts</button>
                  <button onClick={() => respond(x.id, false)} className="rounded-md border-2 border-slate px-4 py-2 font-semibold text-slate">Decline</button>
                </div>
              </li>
            ))}
          </ul>
          {accepted.length > 0 && (
            <>
              <h3 className="display mt-8 text-3xl">Accepted: contact these founders</h3>
              <ul className="mt-2 divide-y divide-rule">
                {accepted.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="font-semibold">{x.startup.name}</span>
                    {x.contactEmail && <a href={`mailto:${x.contactEmail}`} className="font-semibold text-leaf underline">{x.contactEmail}</a>}
                  </li>
                ))}
              </ul>
            </>
          )}
          {declined.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-neel-700">{declined.length} declined</summary>
              <ul className="mt-2 divide-y divide-rule">
                {declined.map((x) => (
                  <li key={x.id} className="py-3">{x.startup.name}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {investor && (
        <section aria-labelledby="matches-h" className="mt-14">
          <h2 id="matches-h" className="display text-4xl">Startups that fit your focus</h2>
          <p className="mt-1 text-neel-700">Only founders who chose to be visible to investors appear here. Financial figures stay private until they send you a request.</p>
          {!investor?.verifiedAt ? (
            <p className="mt-3 rounded-md bg-marigold-50 px-4 py-3 text-marigold-ink">
              Founders choose to be seen by verified investors only, so matching startups appear here once we&apos;ve verified your
              profile. We usually check your firm&apos;s website or LinkedIn, and may email you.
            </p>
          ) : (
            matches.length === 0 && <p className="mt-3 text-slate">No matching startups yet.</p>
          )}
          <ul className="mt-3 divide-y divide-rule">
            {matches.map(({ startup: s, match: m }) => (
              <li key={s.slug} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-semibold">{s.name}</p>
                  <span className="font-semibold text-leaf">{m.score}% match</span>
                </div>
                <p className="text-[0.92rem] text-slate">
                  {[s.sectors.map((x) => sectorLabel(x)).join(", "), stageLabel(s.stage), stateLabel(s.state), s.dpiitRecognised ? "DPIIT recognised" : null].filter(Boolean).join("; ")}
                </p>
                {s.oneLiner && <p className="mt-1">{s.oneLiner}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="iprof-h" className="mt-14 border-t-2 border-neel-900 pt-8">
        <h2 id="iprof-h" className="display text-4xl">{investor ? "Your investor profile" : "List yourself as an investor"}</h2>
        <p className="mt-1 text-neel-700">Free. Founders see your focus and cheque size; your email is shared only when you accept an intro.</p>
        <form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="iname" className={label}>Your name</label>
            <input id="iname" required minLength={2} className={field} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="ifirm" className={label}>Firm or network (optional)</label>
            <input id="ifirm" className={field} value={f.firm} onChange={(e) => set("firm", e.target.value)} />
          </div>
          <div>
            <label htmlFor="itype" className={label}>Type</label>
            <select id="itype" className={field} value={f.type} onChange={(e) => set("type", e.target.value)}>
              {INVESTOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="iweb" className={label}>Website</label>
            <input id="iweb" type="url" placeholder="https://" className={field} value={f.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="ibio" className={label}>About you</label>
            <textarea id="ibio" rows={3} maxLength={1500} className={field} value={f.bio} onChange={(e) => set("bio", e.target.value)} />
          </div>
          <fieldset className="md:col-span-2">
            <legend className={label}>Sectors you invest in</legend>
            <Chips options={SECTORS} value={f.sectors} onChange={(v) => set("sectors", v)} max={8} />
          </fieldset>
          <fieldset className="md:col-span-2">
            <legend className={label}>Stages</legend>
            <Chips options={STAGES} value={f.stages} onChange={(v) => set("stages", v)} max={4} />
          </fieldset>
          <div>
            <label htmlFor="cmin" className={label}>Smallest cheque (₹ lakh)</label>
            <input id="cmin" type="number" min={0} required className={field} value={f.chequeMinInrLakh} onChange={(e) => set("chequeMinInrLakh", e.target.value)} />
          </div>
          <div>
            <label htmlFor="cmax" className={label}>Largest cheque (₹ lakh)</label>
            <input id="cmax" type="number" min={0} required className={field} value={f.chequeMaxInrLakh} onChange={(e) => set("chequeMaxInrLakh", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="istates" className={label}>States you focus on (leave empty for all of India)</label>
            <select
              id="istates"
              multiple
              size={6}
              className={field}
              value={f.states}
              onChange={(e) => set("states", Array.from(e.target.selectedOptions).map((o) => o.value))}
            >
              {INDIAN_STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <label className="md:col-span-2 flex items-start gap-3">
            <input type="checkbox" className="mt-1.5 h-4 w-4 accent-neel-900" checked={f.isListed} onChange={(e) => set("isListed", e.target.checked)} />
            <span>
              <span className="font-semibold">List me in the investor directory</span>
              <span className="block text-[0.92rem] text-slate">Unlisted investors receive no new intro requests.</span>
            </span>
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <button disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">
              {investor ? "Save profile" : "Create investor profile"}
            </button>
            {msg && <p role={msg.kind === "err" ? "alert" : "status"} className={msg.kind === "err" ? "text-marigold-ink" : "text-leaf"}>{msg.text}</p>}
          </div>
        </form>
      </section>
    </>
  );
}
