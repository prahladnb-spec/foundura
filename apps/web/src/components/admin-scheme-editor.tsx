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
  translations: { hi?: HindiText & { updatedAt: string } };
  hi: { status: "missing" | "current" | "outdated"; labels: string[] };
}

interface HindiText {
  name: string;
  summary: string;
  benefits: string[];
  howToApply: string[];
  alsoCheck: string[];
  statusNote: string | null;
  labels: Record<string, string>;
}

const HI_STATUS = {
  missing: { text: "No Hindi yet", cls: "bg-slate-50 text-slate", note: "Hindi pages and emails show this scheme in English until you add a translation." },
  current: { text: "Hindi up to date", cls: "bg-leaf-50 text-leaf", note: "Hindi pages, scan results and alert emails use this text." },
  outdated: {
    text: "Hindi out of date",
    cls: "bg-marigold-50 text-marigold-ink",
    note: "The English changed after this Hindi was written, so Hindi readers see the English for now. Update the Hindi to say the same as the English, then save.",
  },
} as const;

/** Hindi version of a scheme: its own save, so a translator never touches the English or the rule. */
function HindiEditor({ scheme, onSaved }: { scheme: AdminScheme; onSaved: () => void }) {
  const base = scheme.translations?.hi;
  const [h, setH] = useState({
    name: base?.name ?? "",
    summary: base?.summary ?? "",
    statusNote: base?.statusNote ?? "",
    benefits: toLines(base?.benefits ?? []),
    howToApply: toLines(base?.howToApply ?? []),
    alsoCheck: toLines(base?.alsoCheck ?? []),
  });
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(scheme.hi.labels.map((l) => [l, base?.labels?.[l] ?? ""])),
  );
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const st = HI_STATUS[scheme.hi.status];
  const set = (k: keyof typeof h, v: string) => setH((p) => ({ ...p, [k]: v }));

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      await adminCall(`schemes/${scheme.slug}/translations/hi`, "PUT", {
        name: h.name,
        summary: h.summary,
        statusNote: h.statusNote.trim() || null,
        benefits: fromLines(h.benefits),
        howToApply: fromLines(h.howToApply),
        alsoCheck: fromLines(h.alsoCheck),
        labels,
      });
      setMsg({ kind: "ok", text: "Hindi saved. Hindi pages now use it." });
      onSaved();
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const pair = (en: string | string[] | null, children: React.ReactNode) => (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-md bg-slate-50 px-3 py-2 text-[0.93rem] text-slate">
        {Array.isArray(en) ? en.map((x) => <p key={x}>{x}</p>) : en || <em>Empty</em>}
      </div>
      <div lang="hi">{children}</div>
    </div>
  );

  return (
    <section aria-labelledby="hi-h" className="mt-14 border-t-2 border-neel-900 pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="hi-h" className="text-[1.6rem] font-bold">Hindi</h2>
        <span className={`rounded px-2 py-1 font-semibold ${st.cls}`}>{st.text}</span>
      </div>
      <p className="mt-2 max-w-[70ch] text-slate">{st.note} English is on the left; write the Hindi on the right.</p>

      <div className="mt-6 space-y-5">
        <div>
          <p className={fieldLabel}>Name</p>
          {pair(scheme.name, <input aria-label="Hindi name" className={field} value={h.name} onChange={(e) => set("name", e.target.value)} />)}
        </div>
        <div>
          <p className={fieldLabel}>Summary</p>
          {pair(scheme.summary, <textarea aria-label="Hindi summary" rows={4} className={field} value={h.summary} onChange={(e) => set("summary", e.target.value)} />)}
        </div>
        {scheme.statusNote && (
          <div>
            <p className={fieldLabel}>Status note</p>
            {pair(scheme.statusNote, <input aria-label="Hindi status note" className={field} value={h.statusNote} onChange={(e) => set("statusNote", e.target.value)} />)}
          </div>
        )}
        {(
          [
            ["benefits", "What you get"],
            ["howToApply", "How to apply"],
            ["alsoCheck", "Also check"],
          ] as const
        ).map(([k, l]) => (
          <div key={k}>
            <p className={fieldLabel}>{l} (one point per line)</p>
            {pair(scheme[k], <textarea aria-label={`Hindi ${l}`} rows={4} className={field} value={h[k]} onChange={(e) => set(k, e.target.value)} />)}
          </div>
        ))}
        <div>
          <p className={fieldLabel}>Conditions shown in scan results</p>
          <div className="space-y-3">
            {scheme.hi.labels.map((l) => (
              <div key={l}>
                {pair(
                  l,
                  <input
                    aria-label={`Hindi for: ${l}`}
                    className={field}
                    value={labels[l] ?? ""}
                    onChange={(e) => setLabels((p) => ({ ...p, [l]: e.target.value }))}
                  />,
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className={btn}>
          {busy ? "Saving…" : "Save Hindi"}
        </button>
        {msg && <p role="status" className={msg.kind === "ok" ? "text-leaf" : "text-marigold-ink"}>{msg.text}</p>}
      </div>
    </section>
  );
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
      <ul className="mt-1 ms-5 list-disc space-y-1">
        {kids.map((k, i) => (
          <RuleTree key={i} c={k} />
        ))}
      </ul>
    </li>
  );
}

export function AdminSchemeEditor({ scheme: initial }: { scheme: AdminScheme }) {
  const [s, setS] = useState(initial);
  const [hiKey, setHiKey] = useState(0);
  const refresh = async () => {
    setS(await adminCall<AdminScheme>(`schemes/${initial.slug}`));
    setHiKey((k) => k + 1);
  };
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
      setS({ ...s, ...saved });
      await refresh();
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
    <>
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
            <ul className="mt-2 ms-5 list-disc space-y-1 text-[0.95rem]">
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
    <HindiEditor key={hiKey} scheme={s} onSaved={refresh} />
    </>
  );
}
