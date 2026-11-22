"use client";

import { useState } from "react";
import Link from "@/components/locale-link";
import { documentsFor, GOALS, type Goal, type Stage } from "@/documents/finder";

const FORMAT = { doc: "Word", deck: "PowerPoint", sheet: "Excel" } as const;
/** Just what the list shows for each document, passed from the server so the content stays there. */
export type FinderDoc = { title: string; titleHi: string; kind: keyof typeof FORMAT };
import { KindIcon } from "@/components/icons";
import { useT } from "@/i18n/client";

const STAGES: Stage[] = ["idea", "prototype", "early_revenue", "growth"];

function Choice<T extends string>({ name, legend, options, labels, value, onChange }: {
  name: string;
  legend: string;
  options: readonly T[];
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

/** Two questions in, an ordered list of documents out. Nothing is stored. */
export function DocumentsFinder({ docs }: { docs: Record<string, FinderDoc> }) {
  const { lang, t } = useT();
  const d = t.documents;
  const [goal, setGoal] = useState<Goal>("raise");
  const [stage, setStage] = useState<Stage>("prototype");
  const { first, next } = documentsFor(goal, stage);

  const list = (id: string, heading: string, slugs: string[]) => (
    <div>
      <h3 id={id} className="font-semibold">{heading}</h3>
      <ol aria-labelledby={id} className="mt-2 space-y-2">
        {slugs.map((slug, i) => {
          const doc = docs[slug];
          return (
            <li key={slug} className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-marigold text-[0.85rem] font-semibold text-neel-950">{i + 1}</span>
              <span>
                <Link href={`/documents/${slug}`} className="font-semibold text-neel-900 underline">{lang === "hi" ? doc.titleHi : doc.title}</Link>{" "}
                <span lang="en" className="inline-flex items-center gap-1 text-[0.88rem] text-slate"><KindIcon kind={doc.kind} className="h-3.5 w-3.5" />{FORMAT[doc.kind]}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
      <div className="space-y-6">
        <Choice name="goal" legend={d.goal} options={GOALS} labels={d.goals} value={goal} onChange={setGoal} />
        <Choice name="stage" legend={d.stage} options={STAGES} labels={t.labels.stage} value={stage} onChange={setStage} />
      </div>
      <div aria-live="polite" className="grid gap-6 sm:grid-cols-2">
        {list("first-h", d.first, first)}
        {list("next-h", d.next, next)}
      </div>
    </div>
  );
}
