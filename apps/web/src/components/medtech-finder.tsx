"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import { type Goal, hubText, pathwaySteps, type RiskClass, whoDecides } from "@/sectors/medtech";

const GOALS: Goal[] = ["prototype", "study", "make", "import"];
const CLASSES: RiskClass[] = ["A_nsnm", "A", "B", "C", "D", "unsure"];

function Choice<T extends string>({ name, legend, options, labels, value, onChange }: {
  name: string;
  legend: string;
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.95rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-neel-500 ${
              value === o ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white text-neel-900"
            }`}
          >
            <input type="radio" name={name} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
            {labels[o]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Two questions in, the regulatory steps, forms and deciding authority out. Nothing is stored. */
export function MedtechFinder() {
  const { lang } = useT();
  const t = hubText[lang];
  const [goal, setGoal] = useState<Goal>("prototype");
  const [cls, setCls] = useState<RiskClass>("unsure");
  const steps = pathwaySteps(goal, cls);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
      <div className="space-y-6">
        <Choice name="goal" legend={t.finder.goal} options={GOALS} labels={t.finder.goals} value={goal} onChange={setGoal} />
        <Choice name="cls" legend={t.finder.cls} options={CLASSES} labels={t.finder.classes} value={cls} onChange={setCls} />
        <p className="text-[0.92rem] text-slate">{t.finder.examples}</p>
      </div>
      <div aria-live="polite">
        <h3 className="sr-only">{t.finder.yourSteps}</h3>
        <ol className="space-y-0 border-l-[3px] border-neel-100">
          {steps.map((k, i) => {
            const s = t.steps[k];
            const who = whoDecides(k, cls, t);
            return (
              <li key={k} className="relative pb-6 pl-8 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[0.95rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-neel-900 bg-paper text-[0.9rem] font-semibold"
                >
                  {i + 1}
                </span>
                <p className="text-lg font-semibold leading-snug">{s.title}</p>
                <p className="mt-1 text-neel-700">{s.body}</p>
                {(("forms" in s && s.forms) || who) && (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-[0.93rem] sm:grid-cols-[auto_1fr]">
                    {who && (
                      <>
                        <dt className="font-semibold text-slate">{t.finder.whoDecides}</dt>
                        <dd>{who}</dd>
                      </>
                    )}
                    {"forms" in s && s.forms && (
                      <>
                        <dt className="font-semibold text-slate">{t.finder.forms}</dt>
                        <dd>{s.forms}</dd>
                      </>
                    )}
                  </dl>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
