import { INDIAN_STATES, INVESTOR_TYPES, SECTORS, STAGES } from "@foundura/shared";

const find = (list: readonly { value: string; label: string }[], v: string | null | undefined) =>
  list.find((x) => x.value === v)?.label ?? v ?? "";

export const sectorLabel = (v: string) => find(SECTORS, v);
export const stageLabel = (v: string | null | undefined) => find(STAGES, v);
export const stateLabel = (v: string | null | undefined) => find(INDIAN_STATES, v);
export const investorTypeLabel = (v: string) => find(INVESTOR_TYPES, v);

/** ₹ lakh → "₹25 lakh" / "₹1.5 crore". */
export function inrLakh(v: number): string {
  if (v >= 100) {
    const cr = v / 100;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(1)} crore`;
  }
  return `₹${Number.isInteger(v) ? v : v.toFixed(1)} lakh`;
}

export const chequeRange = (min: number, max: number) => (min === max ? inrLakh(min) : `${inrLakh(min)} to ${inrLakh(max)}`);
