"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import { INTL_LOCALE } from "@/i18n/config";

/**
 * Who owns what after one priced round. The new ESOP pool is created before the money comes in
 * (the usual ask), so it dilutes existing holders only. Nothing is stored or sent anywhere.
 */
export function DilutionCalc() {
  const { lang, t } = useT();
  const c = t.basics.calc;
  const [pre, setPre] = useState("16");
  const [raise, setRaise] = useState("4");
  const [founders, setFounders] = useState("85");
  const [pool, setPool] = useState("10");

  const n = (v: string) => Number(v.replace(",", "."));
  const P = n(pre), R = n(raise), F = n(founders) / 100, E = n(pool) / 100;
  const post = P + R;
  const inv = post > 0 ? R / post : 0;
  const ok = P > 0 && R > 0 && F > 0 && F <= 1 && E >= 0 && inv + E < 1;
  const rest = 1 - inv - E;
  const rows = ok
    ? [
        { label: c.investors, v: inv, tone: "bg-marigold" },
        { label: c.foundersAfter, v: F * rest, tone: "bg-neel-700" },
        { label: c.poolAfter, v: E, tone: "bg-leaf" },
        { label: c.others, v: (1 - F) * rest, tone: "bg-slate" },
      ]
    : [];
  const pct = new Intl.NumberFormat(INTL_LOCALE[lang], { style: "percent", maximumFractionDigits: 1 });
  const num = new Intl.NumberFormat(INTL_LOCALE[lang], { maximumFractionDigits: 2 });
  const crore = (v: number) => t.money.crore.replace("{n}", num.format(v));

  const field = (id: string, label: string, value: string, set: (v: string) => void, max?: number) => (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-[0.95rem] font-semibold">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-11 w-full rounded-lg border border-rule bg-white px-3 text-base tabular-nums"
      />
    </label>
  );

  return (
    <section aria-labelledby="calc-h" className="mt-10 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8">
      <h2 id="calc-h" className="display text-3xl">{c.title}</h2>
      <p className="mt-1 text-neel-700">{c.lead}</p>
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4">
          {field("calc-pre", c.pre, pre, setPre)}
          {field("calc-raise", c.raise, raise, setRaise)}
          {field("calc-founders", c.founders, founders, setFounders, 100)}
          {field("calc-pool", c.pool, pool, setPool, 100)}
        </div>
        <div aria-live="polite">
          {ok ? (
            <>
              <p className="text-[0.95rem] text-slate">{c.post}</p>
              <p className="font-body text-4xl font-bold tabular-nums">{crore(post)}</p>
              <div className="mt-4 flex h-4 overflow-hidden rounded-full" aria-hidden="true">
                {rows.map((r) => (
                  <span key={r.label} className={r.tone} style={{ width: `${r.v * 100}%` }} />
                ))}
              </div>
              <dl className="mt-4 grid gap-2">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-rule pb-1.5">
                    <dt className="flex items-center gap-2">
                      <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm ${r.tone}`} />
                      {r.label}
                    </dt>
                    <dd className="font-semibold tabular-nums">{pct.format(r.v)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.95rem] text-neel-700">{c.note}</p>
            </>
          ) : (
            <p className="font-semibold text-marigold-ink">{c.invalid}</p>
          )}
        </div>
      </div>
    </section>
  );
}
