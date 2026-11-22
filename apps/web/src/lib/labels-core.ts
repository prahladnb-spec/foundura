import type { Dict } from "@/i18n/en";
import { f, lab } from "@/i18n/util";

/**
 * Label helpers for one dictionary. Client components use this with `useT().t` (or the English
 * dictionary for the English-only consoles), so no other language's text reaches the browser.
 */
export function labelsFor(t: Dict) {
  const l = t.labels;
  const inrLakh = (v: number): string => {
    if (v >= 100) {
      const cr = v / 100;
      return f(t.money.crore, { n: Number.isInteger(cr) ? cr : cr.toFixed(1) });
    }
    return f(t.money.lakh, { n: Number.isInteger(v) ? v : v.toFixed(1) });
  };
  return {
    sector: (v: string) => String(lab(l.sector, v)),
    stage: (v: string | null | undefined) => String(lab(l.stage, v)),
    lookingFor: (v: string) => String(lab(l.lookingFor, v)),
    state: (v: string | null | undefined) => String(lab(l.state, v)),
    investorType: (v: string) => String(lab(l.investorType, v)),
    entity: (v: string) => String(lab(l.entity, v)),
    /** ₹ lakh → "₹25 lakh" / "₹1.5 crore" in the dictionary's wording. */
    inrLakh,
    chequeRange: (min: number, max: number) => (min === max ? inrLakh(min) : f(t.money.range, { min: inrLakh(min), max: inrLakh(max) })),
  };
}
