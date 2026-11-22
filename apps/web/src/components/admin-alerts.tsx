"use client";

import { useEffect, useState } from "react";
import { adminCall, btn } from "@/lib/admin-client";

interface Preview {
  basedOn: string;
  hasNews: boolean;
  subject: string;
  text: string;
}
interface RunResult {
  weekOf: string;
  recipients: number;
  sent: number;
  alreadySent: number;
  nothingNew: number;
  failed: number;
}

export function AdminAlerts() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminCall<Preview>("digest/preview").then(setPreview, (e) => setErr(e.message));
  }, []);

  async function send() {
    setBusy(true);
    setErr(null);
    try {
      setResult(await adminCall<RunResult>("digest/send", "POST"));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="preview-h">
        <h2 id="preview-h" className="text-[1.35rem] font-bold">This week&apos;s email</h2>
        {preview ? (
          <>
            <p className="mt-1 text-slate">As a first-time reader would see it, based on {preview.basedOn}.</p>
            <div className="mt-4 rounded-md border border-rule bg-white">
              <p className="border-b border-rule px-5 py-3 font-semibold">{preview.subject}</p>
              <pre className="overflow-x-auto px-5 py-4 font-sans text-[0.97rem] leading-relaxed whitespace-pre-wrap">{preview.text}</pre>
            </div>
          </>
        ) : (
          <p className="mt-2 text-slate">{err ?? "Loading preview…"}</p>
        )}
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-md border border-rule bg-white p-4">
          <p className="font-semibold">Sending</p>
          <p className="mt-1 text-[0.95rem] text-slate">
            Goes out automatically on Mondays from 8 am when the server has <code>SCHEDULED_EMAILS=true</code>. Each founder gets at most
            one a week, and nobody gets one if nothing is new for them.
          </p>
          <button type="button" onClick={send} disabled={busy} className={`${btn} mt-4 w-full`}>
            {busy ? "Sending…" : "Send this week's email now"}
          </button>
        </div>
        {result && (
          <div role="status" className="rounded-md bg-leaf-50 p-4 text-leaf">
            <p className="font-semibold">
              Sent {result.sent} of {result.recipients}
            </p>
            <ul className="mt-1 text-[0.95rem]">
              {result.alreadySent > 0 && <li>{result.alreadySent} already had this week&apos;s email</li>}
              {result.nothingNew > 0 && <li>{result.nothingNew} had nothing new, so got nothing</li>}
              {result.failed > 0 && <li className="text-marigold-ink">{result.failed} failed; sending again retries them</li>}
            </ul>
          </div>
        )}
        {err && preview && <p role="alert" className="text-marigold-ink">{err}</p>}
      </aside>
    </div>
  );
}
