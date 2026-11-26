"use client";

import { useState } from "react";
import { JOURNEY, JOURNEY_STAGES, JOURNEY_STEPS, type JourneyStage, type JourneyStep } from "@foundura/shared/constants";
import Link from "@/components/locale-link";
import { f } from "@/i18n/util";
import { useT } from "@/i18n/client";
import { STEP_LINKS } from "@/progress";

type State = { stage: JourneyStage | null; done: JourneyStep[] };

const isStage = (s: string | null): s is JourneyStage => !!s && (JOURNEY_STAGES as string[]).includes(s);

/**
 * The progress tracker on "My startup": the founder picks their stage of the 8 and ticks off its
 * steps. Saved to the startup profile, private, and part of the data export.
 */
export function JourneyTracker({
  startupId,
  stage,
  done,
  docTitles,
}: {
  startupId: string;
  stage: string | null;
  done: string[];
  /** Template titles in the page language, by slug, from the server. */
  docTitles: Record<string, string>;
}) {
  const { t } = useT();
  const p = t.progress;
  const names = t.learn.journey.stages;
  const [state, setState] = useState<State>({
    stage: isStage(stage) ? stage : null,
    done: done.filter((x): x is JourneyStep => (JOURNEY_STEPS as string[]).includes(x)),
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(next: State) {
    const prev = state;
    setState(next);
    setMsg(null);
    try {
      const res = await fetch(`/api/me/startups/${startupId}/journey`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      setMsg({ ok: true, text: p.saved });
    } catch {
      setState(prev);
      setMsg({ ok: false, text: p.failed });
    }
  }

  const doneIn = (s: JourneyStage) => JOURNEY[s].filter((x) => state.done.includes(`${s}.${x}` as JourneyStep)).length;
  const current = state.stage;
  const idx = current ? JOURNEY_STAGES.indexOf(current) : -1;

  return (
    <section aria-labelledby="progress-h" className="mt-16 border-t-2 border-neel-900 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="progress-h" className="display text-4xl">{p.title}</h2>
        <p className="text-slate">{f(p.overall, { n: state.done.length, m: JOURNEY_STEPS.length })}</p>
      </div>
      <p className="mt-2 max-w-[62ch] text-neel-700">{p.lead}</p>

      <fieldset className="mt-6">
        <legend className="font-semibold">{p.stage}</legend>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {JOURNEY_STAGES.map((s, i) => {
            const n = doneIn(s);
            const all = JOURNEY[s].length;
            return (
              <li key={s}>
                <label className="flex h-full min-h-14 cursor-pointer items-start gap-2 rounded-lg border border-rule bg-white px-3 py-2.5 has-[:checked]:border-neel-900 has-[:checked]:bg-neel-900 has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neel-500">
                  <input
                    type="radio"
                    name="journey-stage"
                    value={s}
                    checked={current === s}
                    onChange={() => save({ ...state, stage: s })}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className="font-display text-xl font-extrabold leading-none">{i + 1}</span>
                  <span className="leading-tight">
                    <span className="block font-semibold">{names[i].t}</span>
                    <span className="block text-[0.85rem] opacity-80">{f(p.stageDone, { n, m: all })}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </fieldset>

      {current ? (
        <div className="mt-6 rounded-xl border-2 border-neel-900 bg-white p-6">
          <h3 className="display text-3xl">{names[idx].t}</h3>
          <p className="mt-1 text-neel-700">{names[idx].d}</p>
          <ul className="mt-4 divide-y divide-rule">
            {JOURNEY[current].map((x) => {
              const id = `${current}.${x}` as JourneyStep;
              const link = STEP_LINKS[id];
              const checked = state.done.includes(id);
              return (
                <li key={id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => save({ ...state, done: checked ? state.done.filter((d) => d !== id) : [...state.done, id] })}
                      className="h-5 w-5 accent-leaf"
                    />
                    <span className={checked ? "text-slate line-through decoration-1" : ""}>{p.steps[id]}</span>
                  </label>
                  {link && "doc" in link && docTitles[link.doc] && (
                    <Link href={`/documents/${link.doc}`} className="text-[0.95rem] text-neel-500 underline">
                      {f(p.template, { title: docTitles[link.doc] })}
                    </Link>
                  )}
                  {link && "page" in link && (
                    <Link href={link.page} className="text-[0.95rem] text-neel-500 underline">
                      {p.pages[link.page as keyof typeof p.pages]}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {idx < JOURNEY_STAGES.length - 1 && doneIn(current) === JOURNEY[current].length && (
            <p className="mt-4">
              <button type="button" onClick={() => save({ ...state, stage: JOURNEY_STAGES[idx + 1] })} className="rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950">
                {f(p.next, { stage: names[idx + 1].t })}
              </button>
            </p>
          )}
        </div>
      ) : (
        <p className="mt-6 text-slate">{p.choose}</p>
      )}
      <p role="status" className={`mt-3 min-h-6 ${msg?.ok ? "text-leaf" : "text-marigold-ink"}`}>{msg?.text}</p>
    </section>
  );
}
