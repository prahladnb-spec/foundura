"use client";

import { useMemo, useState } from "react";
import type { Condition } from "@foundura/shared";
import { adminCall, btn, btnQuiet, field, fieldLabel, shortDate } from "@/lib/admin-client";

export interface AdminScheme {
  slug: string;
  name: string;
  issuer: string;
  summary: string;
  benefits: string[];
  howToApply: string[];
  alsoCheck: string[];
  status: "open" | "rolling" | "closed" | "indirect";
  statusNote: string | null;
  sourceUrl: string;
  sourceName: string;
  rule: Condition;
  lastVerifiedAt: string | null;
}

const toLines = (a: string[]) => a.join("\n");
const fromLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/** Shows the rule as nested plain-language conditions. */
function RuleTree({ c }: { c: Condition }) {
  if ("fact" in c) return <li>{c.label}</li>;
  const kids = "all" in c ? c.all : c.any;
  return (
    <li>
      <span className="font-semibold">{c.label ?? ("all" in c ? "All of these" : "Any one of these")}</span>
      <span className="text-slate"> ({"all" in c ? "all must hold" : "any one is enough"})</span>
      <ul className="mt-1 ml-5 list-disc space-y-1">
        {kids.map((k, i) => (
          <RuleTree key={i} c={k} />
        ))}
      </ul>
    </li>
  );
}

export function AdminSchemeEditor({ scheme: initial }: { scheme: AdminScheme }) {
  const [s, setS] = useState(initial);
  const [lines, setLines] = useState({
    benefits: toLines(initial.benefits),
    howToApply: toLines(initial.howToApply),
    alsoCheck: toLines(initial.alsoCheck),
  });
  const [ruleText, setRuleText] = useState(JSON.stringify(initial.rule, null, 2));
  const [checked, setChecked] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedRule = useMemo(() => {
    try {
      return { rule: JSON.parse(ruleText) as Condition };
    } catch (e) {
      return { error: `Not valid JSON: ${(e as Error).message}` };
    }
  }, [ruleText]);

  const set = <K extends keyof AdminScheme>(k: K, v: AdminScheme[K]) => setS((p) => ({ ...p, [k]: v }));

  async function checkRule() {
    if (!parsedRule.rule) return setMsg({ kind: "err", text: parsedRule.error! });
    const r = await adminCall<{ ok: boolean; issues?: { path: string; message: string }[] }>("rules/validate", "POST", parsedRule.rule);
    setMsg(r.ok ? { kind: "ok", text: "The rule is valid." } : { kind: "err", text: r.issues!.map((i) => `${i.path || "rule"}: ${i.message}`).join("; ") });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!parsedRule.rule) return setMsg({ kind: "err", text: parsedRule.error! });
    setBusy(true);
    setMsg(null);
    try {
      const saved = await adminCall<AdminScheme>(`schemes/${s.slug}`, "PUT", {
        name: s.name,
        issuer: s.issuer,
        summary: s.summary,
        benefits: fromLines(lines.benefits),
        howToApply: fromLines(lines.howToApply),
        alsoCheck: fromLines(lines.alsoCheck),
        status: s.status,
        statusNote: s.statusNote?.trim() || null,
        sourceUrl: s.sourceUrl,
        sourceName: s.sourceName,
        rule: parsedRule.rule,
        markVerified: checked,
      });
      setS(saved);
      setChecked(false);
      setMsg({ kind: "ok", text: saved.lastVerifiedAt ? "Saved and marked checked." : "Saved. It shows as not checked until someone confirms it against the source." });
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function markChecked() {
    setBusy(true);
    try {
      const r = await adminCall<{ lastVerifiedAt: string }>(`schemes/${s.slug}/verify`, "POST");
      set("lastVerifiedAt", r.lastVerifiedAt);
      setMsg({ kind: "ok", text: "Marked checked today." });
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-5">
        <div>
          <label className={fieldLabel} htmlFor="name">Name</label>
          <input id="name" className={field} value={s.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="issuer">Run by</label>
            <input id="issuer" className={field} value={s.issuer} onChange={(e) => set("issuer", e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="status">Status</label>
            <select id="status" className={field} value={s.status} onChange={(e) => set("status", e.target.value as AdminScheme["status"])}>
              <option value="open">Open</option>
              <option value="rolling">Rolling (apply any time)</option>
              <option value="closed">Closed</option>
              <option value="indirect">Indirect (through an intermediary)</option>
            </select>
          </div>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="statusNote">Status note</label>
          <input id="statusNote" className={field} value={s.statusNote ?? ""} onChange={(e) => set("statusNote", e.target.value)} />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="summary">Summary</label>
          <textarea id="summary" rows={4} className={field} value={s.summary} onChange={(e) => set("summary", e.target.value)} />
        </div>
        {(
          [
            ["benefits", "What you get"],
            ["howToApply", "How to apply"],
            ["alsoCheck", "Also check"],
          ] as const
        ).map(([k, l]) => (
          <div key={k}>
            <label className={fieldLabel} htmlFor={k}>{l}</label>
            <p className="mb-1 text-[0.9rem] text-slate">One point per line.</p>
            <textarea id={k} rows={4} className={field} value={lines[k]} onChange={(e) => setLines((p) => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="sourceName">Official source name</label>
            <input id="sourceName" className={field} value={s.sourceName} onChange={(e) => set("sourceName", e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="sourceUrl">Official source link</label>
            <input id="sourceUrl" type="url" className={field} value={s.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="rule">Eligibility rule</label>
          <p className="mb-1 text-[0.9rem] text-slate">
            JSON conditions. Rules can only test answers the Scheme Scan asks for; anything else is rejected.
          </p>
          <textarea id="rule" rows={14} spellCheck={false} className={`${field} font-mono text-[0.9rem]`} value={ruleText} onChange={(e) => setRuleText(e.target.value)} />
          <button type="button" onClick={checkRule} className={`${btnQuiet} mt-2`}>Check rule</button>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-md border border-rule bg-white p-4">
          <p className="font-semibold">Last checked against the source</p>
          <p className={s.lastVerifiedAt ? "text-leaf" : "font-semibold text-marigold-ink"}>{s.lastVerifiedAt ? shortDate(s.lastVerifiedAt) : "Not checked"}</p>
          <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">Open {s.sourceName}</a>
          <button type="button" onClick={markChecked} disabled={busy} className={`${btnQuiet} mt-3 block w-full`}>
            Nothing changed, mark checked today
          </button>
        </div>

        <div className="rounded-md border border-rule bg-white p-4">
          <p className="font-semibold">Who qualifies</p>
          {parsedRule.rule ? (
            <ul className="mt-2 ml-5 list-disc space-y-1 text-[0.95rem]">
              <RuleTree c={parsedRule.rule} />
            </ul>
          ) : (
            <p className="mt-2 text-[0.95rem] text-marigold-ink">{parsedRule.error}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1.5" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span>I checked these details against the official source today</span>
          </label>
          <button type="submit" disabled={busy} className={`${btn} w-full`}>{busy ? "Saving…" : "Save changes"}</button>
          {msg && (
            <p role="status" className={msg.kind === "ok" ? "text-leaf" : "text-marigold-ink"}>{msg.text}</p>
          )}
        </div>
      </aside>
    </form>
  );
}
