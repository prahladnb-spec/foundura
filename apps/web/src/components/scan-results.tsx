"use client";

import Link from "@/components/locale-link";
import { f, lab, plural } from "@/i18n/util";
import { useT } from "@/i18n/client";
import { lp } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import type { ScanMatch, ScanResult } from "@/lib/types";
import { Stamp } from "./stamp";
import { useState } from "react";
import { Link2, MessageCircle, Printer } from "lucide-react";
import type { HelpMap } from "@/documents/scheme-help";
import { Icon, KindIcon } from "./icons";

function Reasons({ m }: { m: ScanMatch }) {
  const { lang, t } = useT();
  const r = t.results;
  // Condition lines are English when this scheme has no current translation.
  const cond = m.scheme.contentLang !== lang ? "en" : undefined;
  return (
    <div className="reasons mt-3 grid gap-3 text-[0.93rem] md:grid-cols-2">
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

/** What to do next for a scheme that fits: confirm the open conditions, follow the official steps. */
function NextSteps({ m, help, newTab }: { m: ScanMatch; help?: HelpMap; newTab: boolean }) {
  const { lang, t } = useT();
  const r = t.results;
  const cond = m.scheme.contentLang !== lang ? "en" : undefined;
  const items = [...m.unknown.map((x) => f(r.confirm, { x })), ...m.scheme.howToApply];
  const templates = help?.[m.scheme.category] ?? [];
  if (items.length === 0 && templates.length === 0) return null;
  return (
    <div className="next-steps mt-4 rounded-lg border border-rule bg-paper p-4">
      <p className="font-semibold">{r.nextSteps}</p>
      {items.length > 0 && (
        <>
          <ul lang={cond} className="mt-2 space-y-1.5 text-[0.95rem]">
            {items.map((x, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-leaf)]" />
                  <span>{x}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="no-print mt-2 text-[0.82rem] text-slate">{r.tickNote}</p>
        </>
      )}
      {templates.length > 0 && !newTab && (
        <div className="no-print mt-3">
          <p className="text-[0.9rem] font-semibold text-neel-700">{r.helpTemplates}</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.92rem]">
            {templates.map((h) => (
              <li key={h.slug}>
                <Link href={`/documents/${h.slug}`} className="inline-flex items-center gap-1 text-neel-500 underline">
                  <KindIcon kind={h.kind} className="h-3.5 w-3.5" />
                  {h.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Copy the link, send it on WhatsApp, or print. The link carries the answers after "#". */
function KeepResults({ url }: { url: string }) {
  const { t } = useT();
  const r = t.results;
  const [copied, setCopied] = useState(false);
  const btn = "inline-flex items-center gap-2 rounded-md border-2 border-neel-900 bg-white px-3.5 py-2 font-semibold text-neel-900 no-underline hover:bg-neel-50";
  return (
    <div className="no-print mt-6 rounded-xl border-2 border-dashed border-neel-500 p-4">
      <p className="font-semibold">{r.keep}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className={btn}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch {
              window.prompt(r.copyLink, url);
            }
          }}
        >
          <Icon icon={Link2} className="h-4 w-4" />
          {copied ? r.copied : r.copyLink}
        </button>
        <a className={btn} href={`https://wa.me/?text=${encodeURIComponent(f(r.waText, { url }))}`} target="_blank" rel="noopener noreferrer">
          <Icon icon={MessageCircle} className="h-4 w-4" />
          {r.whatsapp}
        </a>
        <button type="button" className={btn} onClick={() => window.print()}>
          <Icon icon={Printer} className="h-4 w-4" />
          {r.print}
        </button>
      </div>
      <p role="status" className="sr-only">{copied ? r.copied : ""}</p>
      <p className="mt-3 text-[0.88rem] text-slate">{r.linkNote}</p>
    </div>
  );
}

function Row({ m, i, newTab, help }: { m: ScanMatch; i: number; newTab: boolean; help?: HelpMap }) {
  const { lang, t } = useT();
  const s = m.scheme;
  const cond = s.contentLang !== lang ? "en" : undefined;
  const nameCond = lang === "en" ? undefined : "en";
  return (
    <li className="grid gap-3 py-6 border-b border-rule md:grid-cols-[9rem_1fr]">
      <div className="pt-1">
        <Stamp status={m.status} label={t.stamp[m.status]} animate delayMs={Math.min(i, 8) * 70} />
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
        <p lang={cond} className="scheme-summary mt-2 max-w-[70ch]">{s.summary}</p>
        {s.statusNote && <p lang={cond} className="mt-1 text-[0.93rem] text-marigold-ink">{s.statusNote}</p>}
        {m.status !== "not_eligible" ? (
          <>
            <Reasons m={m} />
            <NextSteps m={m} help={help} newTab={newTab} />
          </>
        ) : (
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

export function ScanResults({
  result,
  newTab = false,
  answers = [],
  shareUrl = null,
  help,
  reopened = false,
}: {
  result: ScanResult;
  newTab?: boolean;
  answers?: { k: string; v: string }[];
  shareUrl?: string | null;
  help?: HelpMap;
  reopened?: boolean;
}) {
  const { lang, t } = useT();
  const r = t.results;
  const { counts } = result;
  const shown = result.matches.filter((m) => m.status !== "not_eligible");
  const hidden = result.matches.filter((m) => m.status === "not_eligible");
  return (
    <section aria-labelledby="results-h" className="scan-results mt-10">
      <p className="print-only mb-4 text-[0.9rem]">{f(r.printedOn, { date: fmtDate(result.date, true, lang) })}</p>
      {reopened && <p className="no-print mb-4 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">{r.reopened}</p>}
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
      {shareUrl && <KeepResults url={shareUrl} />}
      {answers.length > 0 && (
        <section aria-labelledby="answers-h" className="mt-6">
          <h3 id="answers-h" className="font-semibold">{r.answers}</h3>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-[0.93rem] sm:grid-cols-[auto_1fr]">
            {answers.map((a) => (
              <div key={a.k} className="contents">
                <dt className="text-slate">{a.k}</dt>
                <dd className="font-semibold">{a.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <ol className="mt-6 border-t-2 border-neel-900">
        {shown.map((m, i) => (
          <Row key={m.scheme.slug} m={m} i={i} newTab={newTab} help={help} />
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
