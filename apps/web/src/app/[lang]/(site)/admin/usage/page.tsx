import { editorApi } from "@/lib/editor-api";
import Link from "next/link";

interface Summary {
  from: string;
  to: string;
  dates: string[];
  metrics: { metric: string; label: string; total: number; series: number[] }[];
  topPages: { key: string; total: number }[];
  topTemplates: { key: string; total: number }[];
}

export const metadata = { title: "Usage" };
const RANGES = [7, 30, 90];
const fmt = (n: number) => n.toLocaleString("en-IN");
const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** A row of bars, one per day. Decorative: the total and the table below carry the numbers. */
function Bars({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  return (
    <div aria-hidden className="mt-3 flex h-12 items-end gap-px">
      {series.map((v, i) => (
        <span key={i} className="flex-1 rounded-t-[2px] bg-neel-500" style={{ height: `${v ? Math.max(6, (v / max) * 100) : 0}%`, opacity: v ? 1 : 0 }} />
      ))}
    </div>
  );
}

function Top({ id, title, rows, empty }: { id: string; title: string; rows: { key: string; total: number }[]; empty: string }) {
  return (
    <section aria-labelledby={`${id}-h`} className="min-w-0">
      <h2 id={`${id}-h`} className="text-xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-slate">{empty}</p>
      ) : (
        <table className="mt-2 w-full text-start">
          <tbody className="divide-y divide-rule border-y border-rule">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="truncate py-2 pe-3 font-mono text-[0.95rem]">{r.key || "/"}</td>
                <td className="py-2 text-end tabular-nums">{fmt(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function AdminUsage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = RANGES.includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 30;
  const s = await editorApi<Summary>(`/admin/metrics?days=${days}`);
  if (!s) return null;
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Usage</h1>
      <p className="mt-3 max-w-[65ch] text-slate">
        Daily totals only. Foundura keeps no record of who visited: no cookies, IP addresses or accounts are linked to these numbers, and
        visits from known bots aren&apos;t counted.
      </p>
      <nav aria-label="Period" className="mt-5 flex flex-wrap items-center gap-2">
        {RANGES.map((n) => (
          <Link key={n} href={`/admin/usage?days=${n}`} aria-current={n === days ? "page" : undefined} className={`rounded-md border-2 px-3 py-1 font-semibold no-underline ${n === days ? "border-neel-900 bg-neel-900 text-white" : "border-rule text-neel-900"}`}>
            Last {n} days
          </Link>
        ))}
        <span className="text-slate">{day(s.from)} to {day(s.to)}</span>
      </nav>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.metrics.map((m) => (
          <li key={m.metric} className="rounded-lg border border-rule p-4">
            <p className="text-neel-700">{m.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{fmt(m.total)}</p>
            <Bars series={m.series} />
          </li>
        ))}
      </ul>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Top id="pages" title="Most viewed pages" rows={s.topPages} empty="No page views in this period." />
        <Top id="templates" title="Most downloaded templates" rows={s.topTemplates} empty="No downloads in this period." />
      </div>
    </>
  );
}
