"use client";

import { useId, useState } from "react";
import type { Question } from "@/basics/quiz";
import { useT } from "@/i18n/client";

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

/**
 * Three questions at the end of a funding basics chapter. Answers are checked here in the browser;
 * nothing is sent or saved. `contentLang` marks the questions when they're shown in English on
 * another language's page.
 */
export function ChapterQuiz({ questions, contentLang }: { questions: Question[]; contentLang?: string }) {
  const { t, lang } = useT();
  const q = t.basics.quiz;
  const id = useId();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const [missing, setMissing] = useState(false);
  const score = picked.filter((p, i) => p === questions[i].answer).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (picked.some((p) => p === null)) return setMissing(true);
    setMissing(false);
    setChecked(true);
  }

  return (
    <section aria-labelledby={`${id}-h`} className="mt-12 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8">
      <h2 id={`${id}-h`} className="display text-3xl">{q.title}</h2>
      <p className="mt-1 text-slate">{q.lead}</p>
      <form onSubmit={submit} className="mt-5 space-y-6" lang={contentLang}>
        {questions.map((item, i) => {
          const right = picked[i] === item.answer;
          return (
            <fieldset key={item.q} className="border-t border-rule pt-4">
              <legend className="font-semibold">
                {i + 1}. {item.q}
              </legend>
              <div className="mt-2 space-y-1.5">
                {item.options.map((o, j) => (
                  <label key={o} className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name={`${id}-q${i}`}
                      checked={picked[i] === j}
                      disabled={checked}
                      onChange={() => setPicked((p) => p.map((v, k) => (k === i ? j : v)))}
                      className="mt-1.5 h-4 w-4 accent-neel-900"
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              {checked && (
                <p className={`mt-2 rounded-md px-3 py-2 ${right ? "bg-leaf-50 text-leaf" : "bg-marigold-50 text-marigold-ink"}`}>
                  <strong lang={contentLang ? lang : undefined}>{right ? q.right : q.wrong}</strong>{" "}
                  {!right && <>{fill(q.answer, { answer: item.options[item.answer] })} </>}
                  {item.why}
                </p>
              )}
            </fieldset>
          );
        })}
        {missing && <p role="alert" className="text-marigold-ink" lang={contentLang ? lang : undefined}>{q.missing}</p>}
        <div className="flex flex-wrap items-center gap-4" lang={contentLang ? lang : undefined}>
          {checked ? (
            <>
              <p role="status" className="font-semibold">{fill(q.score, { n: score, total: questions.length })}</p>
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setPicked(questions.map(() => null));
                }}
                className="rounded-md border-2 border-neel-900 px-4 py-2 font-semibold text-neel-900 hover:bg-neel-900 hover:text-paper"
              >
                {q.retry}
              </button>
            </>
          ) : (
            <button type="submit" className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper hover:bg-neel-950">{q.check}</button>
          )}
        </div>
      </form>
    </section>
  );
}
