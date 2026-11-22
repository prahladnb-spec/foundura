"use client";

import { useEffect, useState } from "react";
import { adminCall, btn, btnQuiet, shortDate } from "@/lib/admin-client";
import { fmtRange } from "@/lib/format";

interface Source {
  id: string;
  name: string;
  url: string;
  kind: "ics" | "page";
  scope: "India" | "Global";
  defaultType: string;
  trusted: boolean;
  active: boolean;
  lastFetchedAt: string | null;
  lastResult: string | null;
  lastError: string | null;
}
interface QueueItem {
  sourceName: string;
  event: { id: string; name: string; startDate: string | null; endDate: string | null; city: string | null; country: string; format: string; status: string; published: boolean; sourceUrl: string | null };
}

const field = "w-full rounded-md border border-rule bg-white px-3 py-2";
const blank = { name: "", url: "", kind: "ics" as const, scope: "Global" as const, defaultType: "Conference", trusted: false };

/** Event sources (what the daily sync reads) and the queue of imported events waiting for an editor. */
export function AdminEvents() {
  const [sources, setSources] = useState<Source[] | null>(null);
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [form, setForm] = useState<{ name: string; url: string; kind: "ics" | "page"; scope: "India" | "Global"; defaultType: string; trusted: boolean }>(blank);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    adminCall<Source[]>("event-sources").then(setSources, (e) => setMsg(e.message));
    adminCall<QueueItem[]>("events/review").then(setQueue, (e) => setMsg(e.message));
  };
  useEffect(load, []);

  async function act(key: string, fn: () => Promise<unknown>, done?: string) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      if (done) setMsg(done);
      load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {msg && <p role="status" className="mb-4 rounded-md bg-neel-50 px-4 py-2">{msg}</p>}

      <section aria-labelledby="queue-h">
        <h2 id="queue-h" className="display text-3xl">Waiting for review</h2>
        <p className="mt-1 max-w-[70ch] text-slate">
          Imported events that aren't public yet, or whose dates changed since an editor last confirmed them. Check each against the
          organiser's page. Publish shows it marked "dates being verified"; confirm shows it as confirmed.
        </p>
        {!queue ? (
          <p className="mt-3 text-slate">Loading…</p>
        ) : queue.length === 0 ? (
          <p className="mt-3 text-slate">Nothing waiting.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {queue.map(({ event: e, sourceName }) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
                <div className="min-w-[18rem] flex-1">
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-[0.95rem] text-slate">
                    {e.startDate ? fmtRange(e.startDate, e.endDate) : "No date"}; {e.format === "Online" ? "Online" : [e.city, e.country].filter(Boolean).join(", ")}; from {sourceName}
                    {e.sourceUrl && <> (<a href={e.sourceUrl} target="_blank" rel="noreferrer">organiser&apos;s page</a>)</>}
                  </p>
                  <p className="text-[0.9rem]">{e.published ? `Public, ${e.status.toLowerCase()}` : "Not public yet"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!e.published && <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(e.id, () => adminCall(`events/${e.id}/review`, "POST", { action: "publish" }))}>Publish</button>}
                  <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(e.id, () => adminCall(`events/${e.id}/review`, "POST", { action: "confirm" }))}>Confirm dates</button>
                  <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(e.id, () => adminCall(`events/${e.id}/review`, "POST", { action: "hide" }))}>Hide</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="sources-h" className="mt-12">
        <h2 id="sources-h" className="display text-3xl">Event sources</h2>
        <p className="mt-1 max-w-[70ch] text-slate">
          The sync reads these once a day from 6:00 India time when EVENT_SYNC is on, and adds new or changed events. Use an
          organiser&apos;s calendar feed (an .ics address) or a page that publishes schema.org event data. Trust a source only if
          it is the organiser itself: its events publish as confirmed without review.
        </p>
        {!sources ? (
          <p className="mt-3 text-slate">Loading…</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 py-3">
                <div className="min-w-[18rem] flex-1">
                  <p className="font-semibold">
                    {s.name} <span className="font-normal text-slate">({s.kind === "ics" ? "calendar feed" : "web page"}, {s.scope === "India" ? "India" : "worldwide"}, {s.defaultType})</span>
                  </p>
                  <p className="break-all text-[0.9rem] text-slate">{s.url}</p>
                  <p className="text-[0.9rem]">
                    {s.trusted ? "Trusted. " : "Needs review. "}
                    {s.active ? "" : "Paused. "}
                    Last read {shortDate(s.lastFetchedAt)}. {s.lastError ? <span className="text-marigold-ink">Failed: {s.lastError}</span> : s.lastResult}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(`sync-${s.id}`, () => adminCall(`event-sources/${s.id}/sync`, "POST"), `Read ${s.name}.`)}>
                    {busy === `sync-${s.id}` ? "Reading…" : "Read now"}
                  </button>
                  <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(s.id, () => adminCall(`event-sources/${s.id}`, "PATCH", { active: !s.active }))}>{s.active ? "Pause" : "Resume"}</button>
                  <button type="button" className={btnQuiet} disabled={busy !== null} onClick={() => act(s.id, () => adminCall(`event-sources/${s.id}`, "PATCH", { trusted: !s.trusted }))}>{s.trusted ? "Stop trusting" : "Trust"}</button>
                  <button
                    type="button"
                    className={btnQuiet}
                    disabled={busy !== null}
                    onClick={() => {
                      if (window.confirm(`Remove ${s.name}? Events already imported stay.`)) void act(s.id, () => adminCall(`event-sources/${s.id}`, "DELETE"));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {sources.length === 0 && <li className="py-3 text-slate">No sources yet. Add the first one below.</li>}
          </ul>
        )}

        <form
          className="mt-6 grid gap-4 rounded-xl border border-rule bg-white p-5 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void act("add", () => adminCall("event-sources", "POST", form), `Added ${form.name}. Use "Read now" to import its events.`).then(() => setForm(blank));
          }}
        >
          <h3 className="text-lg font-semibold md:col-span-2">Add a source</h3>
          <label>
            <span className="mb-1 block font-semibold">Name</span>
            <input required minLength={2} className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            <span className="mb-1 block font-semibold">Address (https://)</span>
            <input required type="url" pattern="https://.*" className={field} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </label>
          <label>
            <span className="mb-1 block font-semibold">Kind</span>
            <select className={field} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "ics" | "page" })}>
              <option value="ics">Calendar feed (.ics)</option>
              <option value="page">Web page with schema.org events</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block font-semibold">Events are</span>
            <select className={field} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as "India" | "Global" })}>
              <option value="Global">Worldwide</option>
              <option value="India">In India</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block font-semibold">Type for its events</span>
            <input required className={field} value={form.defaultType} onChange={(e) => setForm({ ...form, defaultType: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" checked={form.trusted} onChange={(e) => setForm({ ...form, trusted: e.target.checked })} />
            <span>Trusted (the organiser&apos;s own feed): publish without review</span>
          </label>
          <p className="md:col-span-2">
            <button className={btn} disabled={busy !== null}>Add source</button>
          </p>
        </form>
      </section>
    </>
  );
}
