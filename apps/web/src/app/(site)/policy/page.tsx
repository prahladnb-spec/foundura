import type { Metadata } from "next";
import { apiOr } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { PolicyItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Startup policy news",
  description: "Government startup schemes, funds and rules from India's central and state governments and around the world.",
};

export default async function PolicyPage() {
  const items = await apiOr<PolicyItem[]>("/policy", []);
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Policy news</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
        New schemes, funds and rules from governments in India and abroad, with what each means for founders.
      </p>
      <ol className="mt-8 border-t-2 border-neel-900">
        {items.map((p) => (
          <li key={p.slug} className="border-b border-rule py-6">
            <p className="text-[0.92rem] text-slate">
              {fmtDate(p.date)}, {p.country}, {p.instrument.toLowerCase()}, {p.stage.toLowerCase()}
              {p.impact === "High" && (
                <span className="ml-2 rounded bg-marigold px-1.5 py-0.5 text-[0.8rem] font-semibold text-neel-950">High impact</span>
              )}
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-snug">{p.headline}</h2>
            {p.amount && <p className="mt-1 font-semibold text-neel-700">{p.amount}</p>}
            <p className="mt-2 max-w-[68ch]">
              <span className="font-semibold">For founders: </span>
              {p.takeaway}
            </p>
            <p className="mt-2 text-[0.88rem]">
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline text-slate">Source: {p.sourceName}</a>
            </p>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-slate">Policy news will appear here.</li>}
      </ol>
    </div>
  );
}
