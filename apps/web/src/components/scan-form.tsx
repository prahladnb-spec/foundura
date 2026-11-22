"use client";

import { useState } from "react";
import { ENTITY_TYPES, INDIAN_STATES, SECTORS, STAGES, type ScanInput } from "@foundura/shared";
import type { ScanResult } from "@/lib/types";
import { ScanResults } from "./scan-results";

type Tri = "" | "yes" | "no";
const tri = (v: Tri): boolean | undefined => (v === "" ? undefined : v === "yes");
const num = (v: string): number | undefined => (v.trim() === "" ? undefined : Number(v));

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem] focus:border-neel-500";
const label = "block text-[0.95rem] font-semibold text-neel-900 mb-1";
const hint = "block text-[0.85rem] text-slate mt-1";

function YesNo({ name, value, onChange, legend }: { name: string; value: Tri; onChange: (v: Tri) => void; legend: string }) {
  return (
    <fieldset>
      <legend className={label}>{legend}</legend>
      <div className="flex gap-2">
        {(["yes", "no", ""] as Tri[]).map((v) => (
          <label
            key={v || "skip"}
            className={`cursor-pointer rounded-md border px-3.5 py-2 text-[0.95rem] ${
              value === v ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white"
            }`}
          >
            <input type="radio" name={name} className="sr-only" checked={value === v} onChange={() => onChange(v)} />
            {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ScanForm({ initial }: { initial: Partial<Record<string, string>> }) {
  const [entityType, setEntityType] = useState(initial.entityType ?? "");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [state, setState] = useState(initial.state ?? "");
  const [stage, setStage] = useState(initial.stage ?? "");
  const [sectors, setSectors] = useState<string[]>([]);
  const [turnover, setTurnover] = useState("");
  const [support, setSupport] = useState("");
  const [promoter, setPromoter] = useState("");
  const [dpiit, setDpiit] = useState<Tri>("");
  const [deepTech, setDeepTech] = useState<Tri>("");
  const [womenLed, setWomenLed] = useState<Tri>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleSector = (v: string) =>
    setSectors((s) => (s.includes(v) ? s.filter((x) => x !== v) : s.length < 5 ? [...s, v] : s));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body: ScanInput = {
      entityType: (entityType || undefined) as ScanInput["entityType"],
      incorporationDate: incorporationDate || undefined,
      state: (state || undefined) as ScanInput["state"],
      stage: (stage || undefined) as ScanInput["stage"],
      sectors: sectors as ScanInput["sectors"],
      turnoverInrCr: num(turnover),
      govtSupportReceivedInrLakh: num(support),
      indianPromoterSharePct: num(promoter),
      dpiitRecognised: tri(dpiit),
      isDeepTech: tri(deepTech),
      womenLed: tri(womenLed),
    };
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.issues?.[0]?.message ?? data?.message ?? "The scan could not run.");
      setResult(data);
      requestAnimationFrame(() => document.getElementById("results-h")?.scrollIntoView({ behavior: "smooth" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The scan could not run. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="grid gap-8" noValidate>
        <fieldset className="grid gap-5 md:grid-cols-3">
          <legend className="display text-3xl mb-4">Your company</legend>
          <div>
            <label htmlFor="entityType" className={label}>How is it registered?</label>
            <select id="entityType" className={field} value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="">Choose…</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inc" className={label}>Date of incorporation</label>
            <input id="inc" type="date" className={field} value={incorporationDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setIncorporationDate(e.target.value)} />
            <span className={hint}>As on your certificate</span>
          </div>
          <div>
            <label htmlFor="state" className={label}>State or UT</label>
            <select id="state" className={field} value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Choose…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="grid gap-5">
          <legend className="display text-3xl mb-4">Your business</legend>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="stage" className={label}>Stage</label>
              <select id="stage" className={field} value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="">Choose…</option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <YesNo name="deep" legend="Is it deep tech (built on new science or engineering, with R&D and IP)?" value={deepTech} onChange={setDeepTech} />
            </div>
          </div>
          <fieldset>
            <legend className={label}>Sectors (up to 5)</legend>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => {
                const on = sectors.includes(s.value);
                return (
                  <button
                    type="button"
                    key={s.value}
                    aria-pressed={on}
                    onClick={() => toggleSector(s.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-[0.93rem] ${on ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white text-neel-900"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </fieldset>

        <fieldset className="grid gap-5 md:grid-cols-3">
          <legend className="display text-3xl mb-4">Recognition and money</legend>
          <YesNo name="dpiit" legend="Recognised by DPIIT?" value={dpiit} onChange={setDpiit} />
          <div>
            <label htmlFor="turnover" className={label}>Highest yearly turnover so far (₹ crore)</label>
            <input id="turnover" inputMode="decimal" type="number" min={0} step="0.01" className={field} value={turnover} onChange={(e) => setTurnover(e.target.value)} placeholder="e.g. 0.5" />
            <span className={hint}>0.5 = ₹50 lakh</span>
          </div>
          <div>
            <label htmlFor="support" className={label}>Government money received so far (₹ lakh)</label>
            <input id="support" inputMode="decimal" type="number" min={0} className={field} value={support} onChange={(e) => setSupport(e.target.value)} placeholder="0 if none" />
          </div>
          <div>
            <label htmlFor="promoter" className={label}>Shares held by Indian promoters (%)</label>
            <input id="promoter" inputMode="decimal" type="number" min={0} max={100} className={field} value={promoter} onChange={(e) => setPromoter(e.target.value)} placeholder="e.g. 100" />
          </div>
          <div className="md:col-span-2">
            <YesNo name="women" legend="Led by a woman founder (majority stake or director)?" value={womenLed} onChange={setWomenLed} />
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-marigold px-6 py-3 text-lg font-semibold text-neel-950 hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "Checking schemes…" : "Check my schemes"}
          </button>
          <p className="text-[0.9rem] text-slate">Skip anything you don&apos;t know. Nothing you enter here is saved.</p>
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-marigold bg-marigold-50 px-4 py-3 text-marigold-ink">
            {error}
          </p>
        )}
      </form>
      {result && <ScanResults result={result} />}
    </>
  );
}
