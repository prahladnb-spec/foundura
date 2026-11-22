"use client";

import Link from "@/components/locale-link";
import { f, lab, plural } from "@/i18n";
import { useT } from "@/i18n/client";
import { lp } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import type { ScanMatch, ScanResult } from "@/lib/types";
import { Stamp } from "./stamp";

function Reasons({ m }: { m: ScanMatch }) {
  const { lang, t } = useT();
  const r = t.results;
  // Condition lines are English when this scheme has no current translation.
  const cond = m.scheme.contentLang !== lang ? "en" : undefined;
  return (
    <div className="mt-3 grid gap-3 text-[0.93rem] md:grid-cols-2">
      {m.met.length > 0 && (
        <div>
          <p className="font-semibold text-leaf">{r.meet}</p>
          <ul className="mt-1 space-y-1">
            {m.met.map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden className="text-leaf">✓</span>
                <span lang={cond}>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.unmet.length > 0 && (
        <div>
          <p className="font-semibold text-slate">{r.notMet}</p>
          <ul className="mt-1 space-y-1">
            {m.unmet.map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden className="text-slate">✕</span>
                <span lang={cond}>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.unknown.length > 0 && (
        <div>
          <p className="font-semibold text-marigold-ink">{r.toConfirm}</p>
          <ul className="mt-1 space-y-1">
            {m.unknown.map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden className="text-marigold-ink">?</span>
                <span lang={cond}>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.scheme.alsoCheck.length > 0 && m.status !== "not_eligible" && (
        <div>
          <p className="font-semibold text-neel-700">{r.alsoCheck}</p>
          <ul lang={cond} className="mt-1 space-y-1 text-neel-700">
            {m.scheme.alsoCheck.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ m, i, newTab }: { m: ScanMatch; i: number; newTab: boolean }) {
  const { lang, t } = useT();
  const s = m.scheme;
  const cond = s.contentLang !== lang ? "en" : undefined;
  const nameCond = lang === "en" ? undefined : "en";
  return (
    <li className="grid gap-3 py-6 border-b border-rule md:grid-cols-[9rem_1fr]">
      <div className="pt-1">
        <Stamp status={m.status} lang={lang} animate delayMs={Math.min(i, 8) * 70} />
      </div>
      <div>
        <h3 lang={cond} className="text-xl font-semibold">
          {newTab ? (
            <a href={`${lp(lang, `/schemes/${s.slug}`)}?utm_source=embed`} target="_blank" rel="noopener" className="hover:underline">
              {s.name}
            </a>
          ) : (
            <Link href={`/schemes/${s.slug}`} className="hover:underline">
              {s.name}
            </Link>
          )}
        </h3>
        <p className="text-[0.93rem] text-slate">
          <span lang={nameCond}>{s.issuer}</span>
          {s.level === "state" ? `, ${lab(t.labels.state, s.state)}` : ""}
          {"; "}
          {lab(t.labels.category, s.category)}
          {"; "}
          <span className={s.status === "closed" ? "text-marigold-ink font-semibold" : ""}>
            {lab(t.labels.schemeStatus, s.status)}
          </span>
        </p>
        <p lang={cond} className="mt-2 max-w-[70ch]">{s.summary}</p>
        {s.statusNote && <p lang={cond} className="mt-1 text-[0.93rem] text-marigold-ink">{s.statusNote}</p>}
        {m.status !== "not_eligible" ? <Reasons m={m} /> : (
          <details className="mt-2 text-[0.93rem]">
            <summary className="cursor-pointer text-neel-500">{t.results.whyNot}</summary>
            <Reasons m={m} />
          </details>
        )}
        <p className="mt-3 text-[0.88rem] text-slate">
          {t.results.sourceLabel} <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" lang={nameCond} className="underline">{s.sourceName}</a>
          {s.lastVerifiedAt ? f(t.results.sourceChecked, { date: fmtDate(s.lastVerifiedAt, true, lang) }) : t.results.sourceUnchecked}
        </p>
      </div>
    </li>
  );
}

export function ScanResults({ result, newTab = false }: { result: ScanResult; newTab?: boolean }) {
  const { lang, t } = useT();
  const r = t.results;
  const { counts } = result;
  const shown = result.matches.filter((m) => m.status !== "not_eligible");
  const hidden = result.matches.filter((m) => m.status === "not_eligible");
  return (
    <section aria-labelledby="results-h" className="mt-10">
      <h2 id="results-h" className="display text-5xl md:text-6xl">
        {counts.eligible > 0 ? plural(counts.eligible, r.qualifyOne, r.qualifyMany) : r.none}
      </h2>
      <p className="mt-3 text-lg text-neel-700 max-w-[62ch]">
        {counts.maybe > 0 ? f(r.moreCould, { n: counts.maybe }) : ""}
        {f(r.explain, { date: fmtDate(result.date, true, lang) })}
      </p>
      {result.matches.some((m) => m.scheme.contentLang !== lang) && t.common.someSchemesInEnglish && (
        <p className="mt-3 text-[0.92rem] text-slate">{t.common.someSchemesInEnglish}</p>
      )}
      <ol className="mt-6 border-t-2 border-neel-900">
        {shown.map((m, i) => (
          <Row key={m.scheme.slug} m={m} i={i} newTab={newTab} />
        ))}
      </ol>
      {hidden.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold text-neel-700">
            {plural(hidden.length, r.hiddenOne, r.hiddenMany)}
          </summary>
          <ol className="mt-2">
            {hidden.map((m, i) => (
              <Row key={m.scheme.slug} m={m} i={i} newTab={newTab} />
            ))}
          </ol>
        </details>
      )}
      <p className="mt-8 text-[0.9rem] text-slate max-w-[70ch]">
        {r.disclaimer}
      </p>
    </section>
  );
}
