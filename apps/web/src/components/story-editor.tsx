"use client";

import { useEffect, useState } from "react";
import { STORY_CONFIRMATIONS, type StoryConfirmation } from "@foundura/shared/constants";
import { useT } from "@/i18n/client";
import { lp } from "@/i18n/config";
import { f } from "@/i18n/util";
import type { StoryMine } from "@/lib/types";

type Draft = { title: string; body: string; founderName: string; founderRole: string; lang: "en" | "hi" };
const EMPTY: Draft = { title: "", body: "", founderName: "", founderRole: "", lang: "en" };
const EDITABLE = new Set(["draft", "returned", "withdrawn"]);

/**
 * The founder's own story. They write it, tick every confirmation and send it to the editors, who
 * publish it or send it back. While it is with the editors or live it can't be edited; withdrawing
 * takes it off the site at once. Each submission and withdrawal is recorded in the consent ledger.
 */
export function StoryEditor({ startupId }: { startupId: string }) {
  const { lang, t } = useT();
  const s = t.stories;
  const base = `/api/me/startups/${startupId}/story`;
  const [story, setStory] = useState<StoryMine | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [ticked, setTicked] = useState<Set<StoryConfirmation>>(new Set());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = (st: StoryMine | null) => {
    setStory(st);
    setDraft(st ? { title: st.title, body: st.body, founderName: st.founderName, founderRole: st.founderRole ?? "", lang: st.lang } : EMPTY);
  };

  useEffect(() => {
    fetch(base, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { story: null }))
      .then((d: { story: StoryMine | null }) => load(d.story))
      .catch(() => load(null))
      .finally(() => setLoaded(true));
  }, [base]);

  async function call(url: string, method: string, body: unknown, done: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      if (!res.ok) throw new Error();
      if (res.status === 204) load(null);
      else load(((await res.json()) as { story: StoryMine }).story);
      setMsg({ ok: true, text: done });
      return true;
    } catch {
      setMsg({ ok: false, text: s.failed });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const payload = () => ({ ...draft, founderRole: draft.founderRole.trim() || null });
  const save = () => call(base, "PUT", payload(), s.saved);
  async function submit() {
    if (ticked.size !== STORY_CONFIRMATIONS.length) {
      setMsg({ ok: false, text: s.tickAll });
      return;
    }
    // Save first so the consent covers exactly the text on screen.
    if (editable && !(await call(base, "PUT", payload(), s.saved))) return;
    if (await call(`${base}/submit`, "POST", { confirmations: [...ticked] }, s.submitted)) setTicked(new Set());
  }

  const editable = !story || EDITABLE.has(story.status);
  const field = "mt-1 w-full rounded-md border border-rule bg-white px-3 py-2.5";
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <section aria-labelledby="story-h" className="mt-16 border-t-2 border-neel-900 pt-8">
      <h2 id="story-h" className="display text-4xl">{s.edTitle}</h2>
      <p className="mt-2 max-w-[62ch] text-neel-700">{s.edLead}</p>

      {story && (
        <div className="mt-4">
          <p className="font-semibold">{f(s.statusLine, { status: s.status[story.status] })}</p>
          {story.editorNote && story.status === "returned" && <p className="mt-1 max-w-[62ch] rounded-md bg-marigold-50 px-3 py-2">{f(s.editorNote, { note: story.editorNote })}</p>}
          {story.status === "published" && (
            <p className="mt-1"><a href={lp(lang, `/stories/${story.slug}`)} className="text-neel-500 underline">{s.view}</a></p>
          )}
          {!editable && <p className="mt-1 text-[0.95rem] text-slate">{s.locked}</p>}
        </div>
      )}

      <fieldset disabled={!loaded || !editable || busy} className="mt-6 grid max-w-3xl gap-4">
        <label>
          <span className="font-semibold">{s.fTitle}</span>
          <input value={draft.title} onChange={set("title")} maxLength={120} className={field} />
        </label>
        <label>
          <span className="font-semibold">{s.fBody}</span>
          <textarea value={draft.body} onChange={set("body")} rows={12} maxLength={8000} aria-describedby="story-body-help" lang={draft.lang} className={field} />
          <span id="story-body-help" className="mt-1 block text-[0.92rem] text-slate">{s.fBodyHelp}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="font-semibold">{s.fName}</span>
            <input value={draft.founderName} onChange={set("founderName")} maxLength={80} autoComplete="name" className={field} />
          </label>
          <label>
            <span className="font-semibold">{s.fRole}</span>
            <input value={draft.founderRole} onChange={set("founderRole")} maxLength={80} className={field} />
          </label>
          <label>
            <span className="font-semibold">{s.fLang}</span>
            <select value={draft.lang} onChange={set("lang")} className={field}>
              <option value="en">{s.langEn}</option>
              <option value="hi">{s.langHi}</option>
            </select>
          </label>
        </div>
      </fieldset>

      {editable && (
        <fieldset className="mt-8 max-w-3xl">
          <legend className="text-lg font-semibold">{s.confirmTitle}</legend>
          <div className="mt-2 grid gap-2">
            {STORY_CONFIRMATIONS.map((c) => (
              <label key={c} className="flex items-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={ticked.has(c)}
                  onChange={(e) => setTicked((p) => { const n = new Set(p); if (e.target.checked) n.add(c); else n.delete(c); return n; })}
                  className="mt-1 h-5 w-5 shrink-0 accent-neel-900"
                />
                <span>{s.confirm[c]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {editable && (
          <>
            <button type="button" onClick={save} disabled={busy} className="rounded-md border-2 border-neel-900 px-5 py-2 font-semibold disabled:opacity-60">{s.save}</button>
            <button type="button" onClick={submit} disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">{s.submit}</button>
          </>
        )}
        {story && (story.status === "submitted" || story.status === "published") && (
          <button type="button" onClick={() => call(`${base}/withdraw`, "POST", undefined, s.withdrawn)} disabled={busy} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper disabled:opacity-60">{s.withdraw}</button>
        )}
        {story && (
          <button type="button" onClick={() => call(base, "DELETE", undefined, s.deleted)} disabled={busy} className="rounded-md px-3 py-2.5 font-semibold text-marigold-ink underline disabled:opacity-60">{s.remove}</button>
        )}
      </div>
      <p role="status" className={`mt-3 min-h-6 ${msg?.ok ? "text-leaf" : "text-marigold-ink"}`}>{msg?.text}</p>
    </section>
  );
}
