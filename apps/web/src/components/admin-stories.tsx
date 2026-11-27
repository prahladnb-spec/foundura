"use client";

import { useEffect, useState } from "react";
import { adminCall, btnQuiet, shortDate } from "@/lib/admin-client";

interface Row {
  id: string;
  slug: string;
  title: string;
  body: string;
  founderName: string;
  founderRole: string | null;
  status: "submitted" | "returned" | "published" | "withdrawn";
  editorNote: string | null;
  updatedAt: string;
  startupName: string;
  consent: { action: "given" | "withdrawn"; confirmations: string[]; statementVersion: string; at: string; matchesText: boolean } | null;
}

const STATUS: Record<Row["status"], string> = { submitted: "Waiting for review", returned: "Sent back", published: "Published", withdrawn: "Withdrawn by the founder" };

/** Founder stories: read, then publish or send back with a note. Editors never change the text. */
export function AdminStories() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    adminCall<Row[]>("stories").then(setRows, (e) => setErr(e.message));
  }, []);

  async function act(id: string, path: string, body?: unknown) {
    setErr(null);
    try {
      const r = await adminCall<Partial<Row>>(`stories/${id}/${path}`, "POST", body);
      setRows((p) => p!.map((x) => (x.id === id ? { ...x, ...r } : x)));
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (!rows) return <p className="text-slate">{err ?? "Loading stories…"}</p>;
  if (!rows.length) return <p className="text-slate">No founder has sent a story yet.</p>;

  return (
    <>
      {err && <p role="alert" className="mb-4 text-marigold-ink">{err}</p>}
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map((r) => {
          const ok = r.consent?.action === "given" && r.consent.matchesText;
          return (
            <li key={r.id} className="py-5">
              <p className="font-semibold">{r.status === "published" ? <a href={`/stories/${r.slug}`} target="_blank" rel="noreferrer">{r.title}</a> : r.title}</p>
              <p className="text-[0.95rem] text-slate">
                {r.founderName}{r.founderRole ? `, ${r.founderRole}` : ""}, {r.startupName}. {STATUS[r.status]}, updated {shortDate(r.updatedAt)}.
              </p>
              <p className={`mt-1 text-[0.95rem] ${ok ? "text-leaf" : "text-marigold-ink"}`}>
                {r.consent
                  ? `Consent ${r.consent.action === "given" ? "given" : "withdrawn"} ${shortDate(r.consent.at)} (${r.consent.confirmations.length} confirmations, version ${r.consent.statementVersion})${r.consent.action === "given" && !r.consent.matchesText ? "; the text has changed since" : ""}.`
                  : "No consent recorded."}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Read the story</summary>
                <div className="mt-2 max-w-[70ch] whitespace-pre-line rounded-md bg-white p-4">{r.body}</div>
              </details>
              {r.editorNote && <p className="mt-2 text-[0.95rem]">Note sent: {r.editorNote}</p>}
              {(r.status === "submitted" || r.status === "published") && (
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  {r.status === "submitted" && (
                    <button type="button" className={btnQuiet} disabled={!ok} onClick={() => act(r.id, "publish")}>Publish</button>
                  )}
                  <label className="min-w-[18rem] flex-1">
                    <span className="block text-[0.9rem] font-semibold">Note to the founder</span>
                    <input value={notes[r.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} className="mt-1 w-full rounded-md border border-rule bg-white px-3 py-2" />
                  </label>
                  <button type="button" className={btnQuiet} disabled={(notes[r.id] ?? "").trim().length < 5} onClick={() => act(r.id, "return", { note: notes[r.id] })}>
                    {r.status === "published" ? "Take down and send back" : "Send back"}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
