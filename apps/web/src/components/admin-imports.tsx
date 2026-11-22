"use client";

import { useState } from "react";
import { adminCall, btn } from "@/lib/admin-client";

const KINDS = {
  events: {
    title: "Events",
    sheet: "https://claude.ai/artifact/UZoWwmQfscBm3ToNG3nxcF",
    sheetName: "Events tracker",
    columns: "Event, Start, End, City / venue, Country, Scope, Type, Status, Key deadline, Best for, Cost & notes, Source, Last checked",
  },
  policy: {
    title: "Policy news",
    sheet: "https://claude.ai/artifact/2eco6wHQmP7Gm7jMZ7eTQj",
    sheetName: "Policy newsroom",
    columns: "Date, Headline, Country / bloc, Level, Instrument, Policy stage, Impact, Amount, What it means for founders, Source",
  },
} as const;

function Importer({ kind }: { kind: keyof typeof KINDS }) {
  const k = KINDS[kind];
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminCall<{ imported: number }>(`import/${kind}`, "POST", csv, "text/csv");
      setMsg({ kind: "ok", text: `Imported ${r.imported} ${r.imported === 1 ? "row" : "rows"}. Existing rows with the same name and date were updated.` });
      setCsv("");
      setFileName(null);
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby={`${kind}-h`} className="rounded-md border border-rule bg-white p-5">
      <h2 id={`${kind}-h`} className="text-[1.35rem] font-bold">{k.title}</h2>
      <p className="mt-1 text-slate">
        Download the <a href={k.sheet} target="_blank" rel="noreferrer">{k.sheetName}</a> sheet as CSV, then upload it here.
      </p>
      <details className="mt-2 text-[0.95rem] text-slate">
        <summary className="cursor-pointer">Expected columns</summary>
        <p className="mt-1">{k.columns}</p>
      </details>
      <label className="mt-4 block">
        <span className="sr-only">CSV file for {k.title}</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFileName(f.name);
            setCsv(await f.text());
          }}
        />
      </label>
      {fileName && <p className="mt-2 text-[0.95rem]">{fileName}: {Math.max(0, csv.trim().split("\n").length - 1)} rows found</p>}
      <button type="button" onClick={run} disabled={!csv || busy} className={`${btn} mt-4`}>
        {busy ? "Importing…" : `Import ${k.title.toLowerCase()}`}
      </button>
      {msg && <p role="status" className={`mt-3 ${msg.kind === "ok" ? "text-leaf" : "text-marigold-ink"}`}>{msg.text}</p>}
    </section>
  );
}

export function AdminImports() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Importer kind="events" />
      <Importer kind="policy" />
    </div>
  );
}
