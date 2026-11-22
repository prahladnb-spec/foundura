import type { Metadata } from "next";
import Link from "next/link";
import { SECTORS, STAGES } from "@foundura/shared";
import { apiOr } from "@/lib/api";
import { chequeRange, investorTypeLabel, sectorLabel, stageLabel } from "@/lib/labels";
import type { InvestorPublic } from "@/lib/types";

export const metadata: Metadata = {
  title: "Investors backing Indian startups",
  description: "Angels, networks and funds on Foundura, with their sectors, stages and cheque sizes.",
};

export default async function InvestorsPage({ searchParams }: { searchParams: Promise<{ sector?: string; stage?: string }> }) {
  const { sector, stage } = await searchParams;
  const q = new URLSearchParams();
  if (sector) q.set("sector", sector);
  if (stage) q.set("stage", stage);
  const list = await apiOr<InvestorPublic[]>(`/investors${q.size ? `?${q}` : ""}`, [], 0);
  const select = "rounded-md border border-rule bg-white px-3 py-2";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Investors</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-neel-700">
        Who invests in what, at which stage, and how much. Founders with a complete profile get matched and can request
        an intro from their dashboard.
      </p>
      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <label>
          <span className="block text-[0.9rem] font-semibold mb-1">Sector</span>
          <select name="sector" defaultValue={sector ?? ""} className={select}>
            <option value="">All sectors</option>
            {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-[0.9rem] font-semibold mb-1">Stage</span>
          <select name="stage" defaultValue={stage ?? ""} className={select}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <button className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold">Filter</button>
      </form>

      <ul className="mt-8 border-t-2 border-neel-900">
        {list.map((i) => (
          <li key={i.id} className="grid gap-2 border-b border-rule py-5 md:grid-cols-[1fr_14rem]">
            <div>
              <Link href={`/investors/${i.slug}`} className="text-xl font-semibold hover:underline">
                {i.firm ? `${i.firm}` : i.name}
              </Link>
              {i.verified && <span className="ml-2 rounded border border-leaf px-1.5 text-[0.8rem] font-semibold text-leaf">Verified</span>}
              <p className="text-[0.93rem] text-slate">
                {investorTypeLabel(i.type)}
                {i.firm ? `, ${i.name}` : ""}
              </p>
              <p className="mt-1">{i.sectors.map(sectorLabel).join(", ")}</p>
            </div>
            <p className="text-[0.93rem] text-neel-700 md:text-right">
              {chequeRange(i.chequeMinInrLakh, i.chequeMaxInrLakh)}
              <br />
              {i.stages.map(stageLabel).join(", ")}
              {typeof i.responseRatePct === "number" && (
                <>
                  <br />
                  Replies to {i.responseRatePct}% of intros
                </>
              )}
            </p>
          </li>
        ))}
        {list.length === 0 && (
          <li className="py-8">
            <p className="text-lg">No investors match these filters yet.</p>
            <p className="mt-1 text-slate">
              Investors are joining now. <Link href="/signin" className="underline text-neel-500">Investors can list themselves for free</Link>.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
