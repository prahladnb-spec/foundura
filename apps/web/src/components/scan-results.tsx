import Link from "next/link";
import { INDIAN_STATES } from "@foundura/shared";
import { CATEGORY_LABEL, fmtDate, SCHEME_STATUS_LABEL } from "@/lib/format";
import type { ScanMatch, ScanResult } from "@/lib/types";
import { Stamp } from "./stamp";

const stateName = (code: string | null) => INDIAN_STATES.find((s) => s.value === code)?.label ?? code ?? "";

function Reasons({ m }: { m: ScanMatch }) {
  return (
    <div className="mt-3 grid gap-3 text-[0.93rem] md:grid-cols-2">
      {m.met.length > 0 && (
        <div>
          <p className="font-semibold text-leaf">You meet</p>
          <ul className="mt-1 space-y-1">
            {m.met.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-leaf">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.unmet.length > 0 && (
        <div>
          <p className="font-semibold text-slate">Not met</p>
          <ul className="mt-1 space-y-1">
            {m.unmet.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-slate">✕</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.unknown.length > 0 && (
        <div>
          <p className="font-semibold text-marigold-ink">Answer to confirm</p>
          <ul className="mt-1 space-y-1">
            {m.unknown.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-marigold-ink">?</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.scheme.alsoCheck.length > 0 && m.status !== "not_eligible" && (
        <div>
          <p className="font-semibold text-neel-700">Also check yourself</p>
          <ul className="mt-1 space-y-1 text-neel-700">
            {m.scheme.alsoCheck.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ m, i }: { m: ScanMatch; i: number }) {
  const s = m.scheme;
  return (
    <li className="grid gap-3 py-6 border-b border-rule md:grid-cols-[9rem_1fr]">
      <div className="pt-1">
        <Stamp status={m.status} animate delayMs={Math.min(i, 8) * 70} />
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          <Link href={`/schemes/${s.slug}`} className="hover:underline">
            {s.name}
          </Link>
        </h3>
        <p className="text-[0.93rem] text-slate">
          {s.issuer}
          {s.level === "state" ? `, ${stateName(s.state)}` : ""}
          {"; "}
          {CATEGORY_LABEL[s.category] ?? s.category}
          {"; "}
          <span className={s.status === "closed" ? "text-marigold-ink font-semibold" : ""}>
            {SCHEME_STATUS_LABEL[s.status]}
          </span>
        </p>
        <p className="mt-2 max-w-[70ch]">{s.summary}</p>
        {s.statusNote && <p className="mt-1 text-[0.93rem] text-marigold-ink">{s.statusNote}</p>}
        {m.status !== "not_eligible" ? <Reasons m={m} /> : (
          <details className="mt-2 text-[0.93rem]">
            <summary className="cursor-pointer text-neel-500">Why not</summary>
            <Reasons m={m} />
          </details>
        )}
        <p className="mt-3 text-[0.88rem] text-slate">
          Source: <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{s.sourceName}</a>
          {s.lastVerifiedAt ? `. Checked ${fmtDate(s.lastVerifiedAt)}.` : ". Confirm the current rules there before applying."}
        </p>
      </div>
    </li>
  );
}

export function ScanResults({ result }: { result: ScanResult }) {
  const { counts } = result;
  const shown = result.matches.filter((m) => m.status !== "not_eligible");
  const hidden = result.matches.filter((m) => m.status === "not_eligible");
  return (
    <section aria-labelledby="results-h" className="mt-10">
      <h2 id="results-h" className="display text-5xl md:text-6xl">
        {counts.eligible > 0
          ? `You qualify for ${counts.eligible} ${counts.eligible === 1 ? "scheme" : "schemes"}`
          : "No sure matches yet"}
      </h2>
      <p className="mt-3 text-lg text-neel-700 max-w-[62ch]">
        {counts.maybe > 0
          ? `${counts.maybe} more could fit once you answer a few more questions. `
          : ""}
        Each result shows exactly which conditions you meet, based on your answers on {fmtDate(result.date)}.
      </p>
      <ol className="mt-6 border-t-2 border-neel-900">
        {shown.map((m, i) => (
          <Row key={m.scheme.slug} m={m} i={i} />
        ))}
      </ol>
      {hidden.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold text-neel-700">
            {hidden.length} schemes that don&apos;t fit right now
          </summary>
          <ol className="mt-2">
            {hidden.map((m, i) => (
              <Row key={m.scheme.slug} m={m} i={i} />
            ))}
          </ol>
        </details>
      )}
      <p className="mt-8 text-[0.9rem] text-slate max-w-[70ch]">
        Foundura checks the conditions it can from your answers. It is general information, not legal or tax advice. Your
        answers were not stored.
      </p>
    </section>
  );
}
