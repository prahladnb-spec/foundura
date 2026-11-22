"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ENTITY_TYPES, INDIAN_STATES, SECTORS, STAGES } from "@foundura/shared";
import type { ConsentState, ScanResult, Startup } from "@/lib/types";
import { ScanResults } from "./scan-results";

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";
const label = "block text-[0.95rem] font-semibold mb-1";

type Form = {
  name: string;
  oneLiner: string;
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
};

const fromStartup = (s: Startup | null): Form => ({
  name: s?.name ?? "",
  oneLiner: s?.oneLiner ?? "",
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
});

function toBody(f: Form) {
  const n = (v: string) => (v.trim() === "" ? undefined : Number(v));
  const b = (v: string) => (v === "" ? undefined : v === "true");
  const s = (v: string) => (v === "" ? undefined : v);
  return {
    name: f.name,
    oneLiner: s(f.oneLiner),
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
  return (
    <select id={id} className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not sure</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
}

export function Dashboard({ email, startup, consents: initialConsents }: { email: string; startup: Startup | null; consents: ConsentState[] }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Startup | null>(startup);
  const [f, setF] = useState<Form>(fromStartup(startup));
  const [consents, setConsents] = useState(initialConsents);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const saved: Startup = current
        ? await call(`startups/${current.id}`, "PATCH", toBody(f))
        : await call("startups", "POST", toBody(f));
      setCurrent(saved);
      setMsg({ kind: "ok", text: current ? "Profile saved." : "Profile created." });
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
    if (!window.confirm("Delete your account, startup profile and consent records? This cannot be undone.")) return;
    await call("_", "DELETE");
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-6xl">{current?.name ?? "Your startup"}</h1>
          <p className="mt-1 text-slate">Signed in as {email}</p>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="underline text-neel-500">Sign out</button>
        </form>
      </div>

      <section aria-labelledby="profile-h" className="mt-10">
        <h2 id="profile-h" className="display text-4xl">Startup profile</h2>
        <p className="mt-1 text-neel-700">Fill in once; Foundura re-checks schemes for you whenever rules change.</p>
        <form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="name" className={label}>Startup name</label>
            <input id="name" required minLength={2} className={field} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="website" className={label}>Website</label>
            <input id="website" type="url" placeholder="https://" className={field} value={f.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="oneLiner" className={label}>What you do, in one line</label>
            <input id="oneLiner" maxLength={200} className={field} value={f.oneLiner} onChange={(e) => set("oneLiner", e.target.value)} />
          </div>
          <div>
            <label htmlFor="entity" className={label}>Registered as</label>
            <select id="entity" className={field} value={f.entityType} onChange={(e) => set("entityType", e.target.value)}>
              <option value="">Choose…</option>
              {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="inc" className={label}>Date of incorporation</label>
            <input id="inc" type="date" className={field} value={f.incorporationDate} onChange={(e) => set("incorporationDate", e.target.value)} />
          </div>
          <div>
            <label htmlFor="st" className={label}>State or UT</label>
            <select id="st" className={field} value={f.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Choose…</option>
              {INDIAN_STATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stage" className={label}>Stage</label>
            <select id="stage" className={field} value={f.stage} onChange={(e) => set("stage", e.target.value)}>
              <option value="">Choose…</option>
              {STAGES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="dpiit" className={label}>DPIIT recognised?</label>
            <TriSelect id="dpiit" value={f.dpiitRecognised} onChange={(v) => set("dpiitRecognised", v)} />
          </div>
          <div>
            <label htmlFor="deep" className={label}>Deep tech?</label>
            <TriSelect id="deep" value={f.isDeepTech} onChange={(v) => set("isDeepTech", v)} />
          </div>
          <fieldset className="md:col-span-3">
            <legend className={label}>Sectors (up to 5)</legend>
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
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="to" className={label}>Highest yearly turnover (₹ crore)</label>
            <input id="to" type="number" min={0} step="0.01" className={field} value={f.turnoverInrCr} onChange={(e) => set("turnoverInrCr", e.target.value)} />
          </div>
          <div>
            <label htmlFor="gs" className={label}>Government money received (₹ lakh)</label>
            <input id="gs" type="number" min={0} className={field} value={f.govtSupportReceivedInrLakh} onChange={(e) => set("govtSupportReceivedInrLakh", e.target.value)} />
          </div>
          <div>
            <label htmlFor="ip" className={label}>Indian promoters&apos; share (%)</label>
            <input id="ip" type="number" min={0} max={100} className={field} value={f.indianPromoterSharePct} onChange={(e) => set("indianPromoterSharePct", e.target.value)} />
          </div>
          <div>
            <label htmlFor="wl" className={label}>Woman-led?</label>
            <TriSelect id="wl" value={f.womenLed} onChange={(v) => set("womenLed", v)} />
          </div>
          <label className="md:col-span-2 flex items-start gap-3 self-end">
            <input type="checkbox" className="mt-1.5 h-4 w-4 accent-neel-900" checked={f.isPublic} onChange={(e) => set("isPublic", e.target.checked)} />
            <span>
              <span className="font-semibold">Show a public profile</span>
              <span className="block text-[0.92rem] text-slate">Name, one-liner, sectors and stage only. Turnover, funding and shareholding always stay private.</span>
            </span>
          </label>
          <div className="md:col-span-3 flex flex-wrap items-center gap-4">
            <button disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">
              {current ? "Save profile" : "Create profile"}
            </button>
            {current && (
              <button type="button" onClick={runScan} disabled={busy} className="rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 disabled:opacity-60">
                Check my schemes
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

      <section aria-labelledby="privacy-h" className="mt-16 border-t-2 border-neel-900 pt-8">
        <h2 id="privacy-h" className="display text-4xl">Your data and choices</h2>
        <ul className="mt-4 divide-y divide-rule">
          {consents.map((c) => (
            <li key={c.purpose} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <span>
                <span className="font-semibold">{c.label}</span>
                <span className="block text-[0.92rem] text-slate">{c.description}</span>
              </span>
              {c.required ? (
                <span className="text-[0.92rem] text-slate">Needed for your account; delete the account to withdraw</span>
              ) : (
                <button onClick={() => toggleConsent(c)} className={`rounded-md border-2 px-4 py-1.5 font-semibold ${c.granted ? "border-leaf text-leaf" : "border-rule text-neel-700"}`} aria-pressed={c.granted}>
                  {c.granted ? "On" : "Off"}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={exportData} className="rounded-md border-2 border-neel-900 px-4 py-2 font-semibold">Download my data</button>
          <button onClick={deleteAccount} className="rounded-md border-2 border-slate px-4 py-2 font-semibold text-slate">Delete my account</button>
        </div>
      </section>
    </>
  );
}
