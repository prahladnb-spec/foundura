import type { Metadata } from "next";
import Link from "next/link";
import { INDIAN_STATES } from "@foundura/shared";
import { apiOr } from "@/lib/api";
import { CATEGORY_LABEL, SCHEME_STATUS_LABEL } from "@/lib/format";
import type { Scheme } from "@/lib/types";

export const metadata: Metadata = {
  title: "Government schemes for startups",
  description: "Central and state government schemes for Indian startups: recognition, tax, grants, loans and state policies.",
};

const stateName = (code: string | null) => INDIAN_STATES.find((s) => s.value === code)?.label ?? code ?? "";

function List({ items }: { items: Scheme[] }) {
  return (
    <ul className="border-t-2 border-neel-900">
      {items.map((s) => (
        <li key={s.slug} className="grid gap-1 border-b border-rule py-4 md:grid-cols-[1fr_12rem]">
          <div>
            <Link href={`/schemes/${s.slug}`} className="text-lg font-semibold hover:underline">{s.name}</Link>
            <p className="text-neel-700 max-w-[70ch]">{s.summary}</p>
          </div>
          <p className="text-[0.92rem] text-slate md:text-right">
            {CATEGORY_LABEL[s.category] ?? s.category}
            <br />
            <span className={s.status === "closed" ? "font-semibold text-marigold-ink" : ""}>{SCHEME_STATUS_LABEL[s.status]}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function SchemesPage() {
  const schemes = await apiOr<Scheme[]>("/schemes", []);
  const national = schemes.filter((s) => s.level === "national");
  const state = schemes.filter((s) => s.level === "state");
  const states = [...new Set(state.map((s) => s.state))];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Schemes</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
        {schemes.length} schemes so far. Not sure which fit? <Link href="/scan" className="underline text-neel-500">Run the Scheme Scan</Link>.
      </p>
      <h2 className="display mt-10 mb-3 text-4xl">Central government</h2>
      <List items={national} />
      {states.map((code) => (
        <section key={code}>
          <h2 className="display mt-10 mb-3 text-4xl">{stateName(code)}</h2>
          <List items={state.filter((s) => s.state === code)} />
        </section>
      ))}
      <p className="mt-10 text-[0.9rem] text-slate">
        More states are being added. Summaries are not legal advice; confirm on each scheme&apos;s official source.
      </p>
    </div>
  );
}
