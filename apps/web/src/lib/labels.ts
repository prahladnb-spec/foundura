import type { Lang } from "@/i18n/config";
import { f, getDict, lab } from "@/i18n";

export const sectorLabel = (v: string, lang: Lang = "en") => String(lab(getDict(lang).labels.sector, v));
export const stageLabel = (v: string | null | undefined, lang: Lang = "en") => String(lab(getDict(lang).labels.stage, v));
export const lookingForLabel = (v: string, lang: Lang = "en") => String(lab(getDict(lang).labels.lookingFor, v));
export const stateLabel = (v: string | null | undefined, lang: Lang = "en") => String(lab(getDict(lang).labels.state, v));
export const investorTypeLabel = (v: string, lang: Lang = "en") => String(lab(getDict(lang).labels.investorType, v));
export const entityLabel = (v: string, lang: Lang = "en") => String(lab(getDict(lang).labels.entity, v));

/** ₹ lakh → "₹25 lakh" / "₹1.5 crore" (or लाख / करोड़). */
export function inrLakh(v: number, lang: Lang = "en"): string {
  const m = getDict(lang).money;
  if (v >= 100) {
    const cr = v / 100;
    return f(m.crore, { n: Number.isInteger(cr) ? cr : cr.toFixed(1) });
  }
  return f(m.lakh, { n: Number.isInteger(v) ? v : v.toFixed(1) });
}

export const chequeRange = (min: number, max: number, lang: Lang = "en") =>
  min === max ? inrLakh(min, lang) : f(getDict(lang).money.range, { min: inrLakh(min, lang), max: inrLakh(max, lang) });
