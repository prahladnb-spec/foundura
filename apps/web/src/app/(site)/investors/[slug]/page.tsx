import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { chequeRange, investorTypeLabel, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import type { InvestorPublic } from "@/lib/types";

async function load(slug: string): Promise<InvestorPublic> {
  try {
    return await api<InvestorPublic>(`/investors/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const i = await load((await params).slug);
  return { title: i.firm ?? i.name, description: i.bio ?? `${investorTypeLabel(i.type)} on Foundura` };
}

export default async function InvestorPage({ params }: { params: Promise<{ slug: string }> }) {
  const i = await load((await params).slug);
  const rows: [string, string][] = [
    ["Type", investorTypeLabel(i.type)],
    ["Sectors", i.sectors.map(sectorLabel).join(", ")],
    ["Stages", i.stages.map(stageLabel).join(", ")],
    ["Where", i.states.length ? i.states.map(stateLabel).join(", ") : "Across India"],
    ["Cheque size", chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh)],
  ];
  if (typeof i.responseRatePct === "number") rows.push(["Replies to intros", `${i.responseRatePct}%`]);

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <p className="text-slate"><Link href="/investors" className="underline">Investors</Link></p>
      <h1 className="display mt-2 text-5xl md:text-6xl">{i.firm ?? i.name}</h1>
      <p className="mt-2 text-slate">
        {i.firm ? i.name : investorTypeLabel(i.type)}
        {i.verified ? "; identity verified by Foundura" : "; not yet verified by Foundura"}
      </p>
      {i.bio && <p className="mt-6 text-lg max-w-[65ch]">{i.bio}</p>}
      <dl className="mt-8 border-t-2 border-neel-900">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 border-b border-rule py-3">
            <dt className="font-semibold">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {i.website && (
        <p className="mt-4">
          <a href={i.website} target="_blank" rel="noopener noreferrer" className="underline text-neel-500">Website</a>
        </p>
      )}
      <div className="mt-10 rounded-xl border-2 border-neel-900 p-6">
        <p className="text-lg font-semibold">Want an intro?</p>
        <p className="mt-1 text-neel-700">
          Complete your startup profile. If your readiness score and match are strong enough, you can request an intro from
          your dashboard. Contact details are shared only if the investor accepts.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">
          Go to my startup
        </Link>
      </div>
    </article>
  );
}
