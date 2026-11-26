"use client";

import { useEffect, useMemo, useState } from "react";
import { f } from "@/i18n/util";
import { useT } from "@/i18n/client";
import { INTL_LOCALE } from "@/i18n/config";

const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";
const label = "mb-1 block text-[0.95rem] font-semibold";

const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
const num = (s: string) => {
  const n = Number(s.replace(/[,\s]/g, ""));
  return s.trim() !== "" && Number.isFinite(n) ? n : null;
};

/**
 * Writes a monthly investor update from the founder's own numbers and news. Plain arithmetic, no AI:
 * everything stays in the browser, nothing is saved or sent.
 */
export function InvestorUpdateBuilder() {
  const { lang, t } = useT();
  const u = t.update;
  const o = u.out;
  const now = new Date();
  const [v, setV] = useState({
    company: "",
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    highlights: "",
    lowlights: "",
    revenue: "",
    spent: "",
    cash: "",
    customers: "",
    team: "",
    asks: "",
  });
  const [copied, setCopied] = useState<string | null>(null);
  // Dates and number formats come from the browser's own locale data, which can differ from the
  // server's, so the preview is filled in after the page loads.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  const { subject, body, runway } = useMemo(() => {
    const locale = INTL_LOCALE[lang];
    const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
    const count = (n: number) => new Intl.NumberFormat(locale).format(n);
    const [y, m] = v.month.split("-").map(Number);
    const month = y && m ? new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" }) : "";
    const company = v.company.trim() || u.companyFallback;

    const revenue = num(v.revenue);
    const spent = num(v.spent);
    const cash = num(v.cash);
    const burn = spent !== null ? spent - (revenue ?? 0) : null;
    let runway: string | null = null;
    if (cash !== null && burn !== null) runway = burn > 0 ? f(o.runwayMonths, { n: count(Math.floor((cash / burn) * 10) / 10) }) : o.noBurn;

    const numbers: string[] = [];
    if (revenue !== null) numbers.push(`${o.revenue}: ${money(revenue)}`);
    if (spent !== null) numbers.push(`${o.spent}: ${money(spent)}`);
    if (burn !== null && burn > 0 && revenue !== null) numbers.push(`${o.burn}: ${money(burn)}`);
    if (cash !== null) numbers.push(`${o.cash}: ${money(cash)}`);
    if (runway) numbers.push(`${o.runway}: ${runway}`);
    const customers = num(v.customers);
    const team = num(v.team);
    if (customers !== null) numbers.push(`${o.customers}: ${count(customers)}`);
    if (team !== null) numbers.push(`${o.team}: ${count(team)}`);

    const section = (title: string, items: string[]) => (items.length ? [title, ...items.map((x) => `- ${x}`), ""] : []);
    const body = [
      o.hi,
      "",
      f(o.intro, { month }),
      "",
      ...section(o.highlights, lines(v.highlights)),
      ...section(o.lowlights, lines(v.lowlights)),
      ...section(o.numbers, numbers),
      ...section(o.asks, lines(v.asks)),
      o.thanks,
      company,
    ].join("\n");
    return { subject: f(o.subject, { company, month }), body, runway };
  }, [v, lang, o, u.companyFallback]);

  async function copy(what: "subject" | "body") {
    try {
      await navigator.clipboard.writeText(what === "subject" ? subject : body);
      setCopied(what);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form className="grid content-start gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="u-company" className={label}>{u.company}</label>
            <input id="u-company" className={field} value={v.company} onChange={set("company")} autoComplete="organization" />
          </div>
          <div>
            <label htmlFor="u-month" className={label}>{u.month}</label>
            <input id="u-month" type="month" className={field} value={v.month} onChange={set("month")} />
          </div>
        </div>
        <div>
          <label htmlFor="u-high" className={label}>{u.highlights}</label>
          <textarea id="u-high" rows={4} className={field} value={v.highlights} onChange={set("highlights")} aria-describedby="u-lines" />
          <p id="u-lines" className="mt-1 text-[0.9rem] text-slate">{u.linesHint}</p>
        </div>
        <div>
          <label htmlFor="u-low" className={label}>{u.lowlights}</label>
          <textarea id="u-low" rows={3} className={field} value={v.lowlights} onChange={set("lowlights")} />
        </div>
        <fieldset>
          <legend className="font-display text-xl font-bold">{u.numbers}</legend>
          <p className="mt-1 text-[0.9rem] text-slate">{u.numbersHint}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {(["revenue", "spent", "cash", "customers", "team"] as const).map((k) => (
              <div key={k}>
                <label htmlFor={`u-${k}`} className={label}>{u[k]}</label>
                <input id={`u-${k}`} inputMode="numeric" className={field} value={v[k]} onChange={set(k)} dir="ltr" />
              </div>
            ))}
          </div>
          {ready && runway && <p className="mt-3 font-semibold text-neel-700">{o.runway}: {runway}</p>}
          <p className="mt-1 text-[0.9rem] text-slate">{u.runwayNote}</p>
        </fieldset>
        <div>
          <label htmlFor="u-asks" className={label}>{u.asks}</label>
          <textarea id="u-asks" rows={3} className={field} value={v.asks} onChange={set("asks")} />
          <p className="mt-1 text-[0.9rem] text-slate">{u.asksHint}</p>
        </div>
      </form>

      <section aria-labelledby="u-preview-h" className="content-start">
        <h2 id="u-preview-h" className="display text-3xl">{u.preview}</h2>
        <label htmlFor="u-subject" className={`${label} mt-4`}>{u.subject}</label>
        <div className="flex gap-2">
          <input id="u-subject" readOnly value={ready ? subject : ""} className={`${field} min-w-0`} />
          <button type="button" onClick={() => copy("subject")} className="shrink-0 rounded-md border-2 border-neel-900 px-4 font-semibold">{u.copy}<span className="sr-only">: {u.subject}</span></button>
        </div>
        <label htmlFor="u-body" className={`${label} mt-4`}>{u.body}</label>
        <textarea id="u-body" readOnly rows={22} value={ready ? body : ""} className={`${field} font-[inherit] leading-relaxed`} />
        <p className="mt-3 flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => copy("body")} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper">{u.copy}<span className="sr-only">: {u.body}</span></button>
          <span role="status" className="text-leaf">{copied ? u.copied : ""}</span>
        </p>
      </section>
    </div>
  );
}
