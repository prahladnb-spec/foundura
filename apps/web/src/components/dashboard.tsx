"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ENTITY_TYPES, INDIAN_STATES, SECTORS, STAGES } from "@foundura/shared";
import { f as fmt, lab } from "@/i18n";
import { useT } from "@/i18n/client";
import { lp } from "@/i18n/config";
import type { ConsentState, ScanResult, Startup } from "@/lib/types";
import { FounderInvestors } from "./founder-investors";
import { ScanResults } from "./scan-results";

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";
const label = "block text-[0.95rem] font-semibold mb-1";

type Form = {
  name: string;
  oneLiner: string;
  description: string;
  website: string;
  entityType: string;
  incorporationDate: string;
  state: string;
  stage: string;
  sectors: string[];
  turnoverInrCr: string;
  govtSupportReceivedInrLakh: string;
  indianPromoterSharePct: string;
  dpiitRecognised: string;
  isDeepTech: string;
  womenLed: string;
  isPublic: boolean;
  deckUrl: string;
  raisingInrLakh: string;
};

const fromStartup = (s: Startup | null): Form => ({
  name: s?.name ?? "",
  oneLiner: s?.oneLiner ?? "",
  description: s?.description ?? "",
  website: s?.website ?? "",
  entityType: s?.entityType ?? "",
  incorporationDate: s?.incorporationDate ?? "",
  state: s?.state ?? "",
  stage: s?.stage ?? "",
  sectors: s?.sectors ?? [],
  turnoverInrCr: s?.turnoverInrCr?.toString() ?? "",
  govtSupportReceivedInrLakh: s?.govtSupportReceivedInrLakh?.toString() ?? "",
  indianPromoterSharePct: s?.indianPromoterSharePct?.toString() ?? "",
  dpiitRecognised: s?.dpiitRecognised == null ? "" : String(s.dpiitRecognised),
  isDeepTech: s?.isDeepTech == null ? "" : String(s.isDeepTech),
  womenLed: s?.womenLed == null ? "" : String(s.womenLed),
  isPublic: s?.isPublic ?? false,
  deckUrl: s?.deckUrl ?? "",
  raisingInrLakh: s?.raisingInrLakh?.toString() ?? "",
});

function toBody(f: Form) {
  const n = (v: string) => (v.trim() === "" ? undefined : Number(v));
  const b = (v: string) => (v === "" ? undefined : v === "true");
  const s = (v: string) => (v === "" ? undefined : v);
  return {
    name: f.name,
    oneLiner: s(f.oneLiner),
    description: s(f.description),
    website: f.website,
    entityType: s(f.entityType),
    incorporationDate: s(f.incorporationDate),
    state: s(f.state),
    stage: s(f.stage),
    sectors: f.sectors,
    turnoverInrCr: n(f.turnoverInrCr),
    govtSupportReceivedInrLakh: n(f.govtSupportReceivedInrLakh),
    indianPromoterSharePct: n(f.indianPromoterSharePct),
    dpiitRecognised: b(f.dpiitRecognised),
    isDeepTech: b(f.isDeepTech),
    womenLed: b(f.womenLed),
    isPublic: f.isPublic,
    deckUrl: f.deckUrl,
    raisingInrLakh: n(f.raisingInrLakh),
  };
}

async function call(path: string, method: string, body?: unknown) {
  const res = await fetch(`/api/me/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.issues?.[0] ? `${data.issues[0].path}: ${data.issues[0].message}` : data?.message ?? "Request failed");
  return data;
}

function TriSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  return (
    <select id={id} className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{t.common.notSure}</option>
      <option value="true">{t.common.yes}</option>
      <option value="false">{t.common.no}</option>
    </select>
  );
}

export function Dashboard({ email, isAdmin = false, startup, consents: initialConsents }: { email: string; isAdmin?: boolean; startup: Startup | null; consents: ConsentState[] }) {
  const router = useRouter();
  const { lang, t } = useT();
  const d = t.dashboard;
  const [current, setCurrent] = useState<Startup | null>(startup);
  const [f, setF] = useState<Form>(fromStartup(startup));
  const [consents, setConsents] = useState(initialConsents);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Bumped after saves and consent changes so the readiness card and matches refresh.
  const [version, setVersion] = useState(0);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const consentText = (c: ConsentState) =>
    (t.labels.consent as Record<string, { label: string; description: string }>)[c.purpose] ?? c;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const saved: Startup = current
        ? await call(`startups/${current.id}`, "PATCH", toBody(f))
        : await call("startups", "POST", toBody(f));
      setCurrent(saved);
      setVersion((v) => v + 1);
      setMsg({ kind: "ok", text: current ? d.saved : d.created });
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function runScan() {
    if (!current) return;
    setBusy(true);
    try {
      setScan(await call(`startups/${current.id}/scan`, "GET"));
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function toggleConsent(c: ConsentState) {
    try {
      setConsents(await call("consents", "POST", { purpose: c.purpose, granted: !c.granted }));
      setVersion((v) => v + 1);
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    }
  }

  async function exportData() {
    const data = await call("export", "GET");
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "foundura-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!window.confirm(d.confirmDelete)) return;
    await call("_", "DELETE");
    await fetch("/api/auth/signout", { method: "POST" });
    router.push(lp(lang, "/"));
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-6xl">{current?.name ?? d.yourStartup}</h1>
          <p className="mt-1 text-slate">
            {fmt(d.signedInAs, { email })}
            {isAdmin && (
              <>
                {". "}
                <a href="/admin">{d.editorConsole}</a>
              </>
            )}
          </p>
          <nav aria-label="Dashboard" className="mt-4 flex gap-2">
            <span aria-current="page" className="rounded-full border border-neel-900 bg-neel-900 px-4 py-1.5 text-paper">{d.tabStartup}</span>
            <a href={lp(lang, "/dashboard/investor")} className="rounded-full border border-rule bg-white px-4 py-1.5 text-neel-900 no-underline">{d.tabInvestor}</a>
          </nav>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="underline text-neel-500">{d.signOut}</button>
        </form>
      </div>

      <section aria-labelledby="profile-h" className="mt-10">
        <h2 id="profile-h" className="display text-4xl">{d.profile}</h2>
        <p className="mt-1 text-neel-700">{d.profileLead}</p>
        <form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="name" className={label}>{d.name}</label>
            <input id="name" required minLength={2} className={field} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="website" className={label}>{d.website}</label>
            <input id="website" type="url" placeholder="https://" className={field} value={f.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="oneLiner" className={label}>{d.oneLiner}</label>
            <input id="oneLiner" maxLength={200} className={field} value={f.oneLiner} onChange={(e) => set("oneLiner", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="description" className={label}>{d.description}</label>
            <textarea id="description" rows={4} maxLength={4000} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder={d.descriptionPh} />
          </div>
          <div>
            <label htmlFor="entity" className={label}>{d.registeredAs}</label>
            <select id="entity" className={field} value={f.entityType} onChange={(e) => set("entityType", e.target.value)}>
              <option value="">{t.common.choose}</option>
              {ENTITY_TYPES.map((x) => <option key={x.value} value={x.value}>{lab(t.labels.entity, x.value)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="inc" className={label}>{d.incDate}</label>
            <input id="inc" type="date" className={field} value={f.incorporationDate} onChange={(e) => set("incorporationDate", e.target.value)} />
          </div>
          <div>
            <label htmlFor="st" className={label}>{d.state}</label>
            <select id="st" className={field} value={f.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">{t.common.choose}</option>
              {INDIAN_STATES.map((x) => <option key={x.value} value={x.value}>{lab(t.labels.state, x.value)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stage" className={label}>{d.stage}</label>
            <select id="stage" className={field} value={f.stage} onChange={(e) => set("stage", e.target.value)}>
              <option value="">{t.common.choose}</option>
              {STAGES.map((x) => <option key={x.value} value={x.value}>{lab(t.labels.stage, x.value)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="dpiit" className={label}>{d.dpiit}</label>
            <TriSelect id="dpiit" value={f.dpiitRecognised} onChange={(v) => set("dpiitRecognised", v)} />
          </div>
          <div>
            <label htmlFor="deep" className={label}>{d.deepTech}</label>
            <TriSelect id="deep" value={f.isDeepTech} onChange={(v) => set("isDeepTech", v)} />
          </div>
          <fieldset className="md:col-span-3">
            <legend className={label}>{d.sectors}</legend>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => {
                const on = f.sectors.includes(s.value);
                return (
                  <button
                    type="button"
                    key={s.value}
                    aria-pressed={on}
                    onClick={() => set("sectors", on ? f.sectors.filter((x) => x !== s.value) : f.sectors.length < 5 ? [...f.sectors, s.value] : f.sectors)}
                    className={`rounded-full border px-3.5 py-1.5 text-[0.93rem] ${on ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white"}`}
                  >
                    {lab(t.labels.sector, s.value)}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="to" className={label}>{d.turnover}</label>
            <input id="to" type="number" min={0} step="0.01" className={field} value={f.turnoverInrCr} onChange={(e) => set("turnoverInrCr", e.target.value)} />
          </div>
          <div>
            <label htmlFor="gs" className={label}>{d.support}</label>
            <input id="gs" type="number" min={0} className={field} value={f.govtSupportReceivedInrLakh} onChange={(e) => set("govtSupportReceivedInrLakh", e.target.value)} />
          </div>
          <div>
            <label htmlFor="ip" className={label}>{d.promoter}</label>
            <input id="ip" type="number" min={0} max={100} className={field} value={f.indianPromoterSharePct} onChange={(e) => set("indianPromoterSharePct", e.target.value)} />
          </div>
          <div>
            <label htmlFor="deck" className={label}>{d.deck}</label>
            <input id="deck" type="url" placeholder="https://" className={field} value={f.deckUrl} onChange={(e) => set("deckUrl", e.target.value)} />
            <span className="block text-[0.85rem] text-slate mt-1">{d.deckHint}</span>
          </div>
          <div>
            <label htmlFor="raise" className={label}>{d.raise}</label>
            <input id="raise" type="number" min={0} className={field} value={f.raisingInrLakh} onChange={(e) => set("raisingInrLakh", e.target.value)} />
            <span className="block text-[0.85rem] text-slate mt-1">{d.raiseHint}</span>
          </div>
          <div>
            <label htmlFor="wl" className={label}>{d.womenLed}</label>
            <TriSelect id="wl" value={f.womenLed} onChange={(v) => set("womenLed", v)} />
          </div>
          <label className="md:col-span-2 flex items-start gap-3 self-end">
            <input type="checkbox" className="mt-1.5 h-4 w-4 accent-neel-900" checked={f.isPublic} onChange={(e) => set("isPublic", e.target.checked)} />
            <span>
              <span className="font-semibold">{d.public}</span>
              <span className="block text-[0.92rem] text-slate">{d.publicHint}</span>
            </span>
          </label>
          <div className="md:col-span-3 flex flex-wrap items-center gap-4">
            <button disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">
              {current ? d.save : d.create}
            </button>
            {current && (
              <button type="button" onClick={runScan} disabled={busy} className="rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 disabled:opacity-60">
                {d.checkSchemes}
              </button>
            )}
            {msg && (
              <p role={msg.kind === "err" ? "alert" : "status"} className={msg.kind === "err" ? "text-marigold-ink" : "text-leaf"}>
                {msg.text}
              </p>
            )}
          </div>
        </form>
        {scan && <ScanResults result={scan} />}
      </section>

      {current && <FounderInvestors startupId={current.id} version={version} />}

      <section aria-labelledby="privacy-h" className="mt-16 border-t-2 border-neel-900 pt-8">
        <h2 id="privacy-h" className="display text-4xl">{d.data}</h2>
        <ul className="mt-4 divide-y divide-rule">
          {consents.map((c) => (
            <li key={c.purpose} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <span>
                <span className="font-semibold">{consentText(c).label}</span>
                <span className="block text-[0.92rem] text-slate">{consentText(c).description}</span>
              </span>
              {c.required ? (
                <span className="text-[0.92rem] text-slate">{d.requiredConsent}</span>
              ) : (
                <button onClick={() => toggleConsent(c)} className={`rounded-md border-2 px-4 py-1.5 font-semibold ${c.granted ? "border-leaf text-leaf" : "border-rule text-neel-700"}`} aria-pressed={c.granted}>
                  {c.granted ? d.on : d.off}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={exportData} className="rounded-md border-2 border-neel-900 px-4 py-2 font-semibold">{d.download}</button>
          <button onClick={deleteAccount} className="rounded-md border-2 border-slate px-4 py-2 font-semibold text-slate">{d.delete}</button>
        </div>
      </section>
    </>
  );
}
