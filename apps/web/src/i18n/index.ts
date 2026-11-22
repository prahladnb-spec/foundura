import { en, type Dict } from "./en";
import { hi } from "./hi";
import { type Lang, f, plural } from "./config";

export type { Dict };
export { f, plural };

const DICTS: Record<Lang, Dict> = { en, hi };

export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}

/** Look up a label map by a dynamic key, falling back to the key itself. */
export function lab<T extends Record<string, unknown>>(map: T, key: string | null | undefined): T[keyof T] | string {
  if (!key) return "";
  return (map as Record<string, T[keyof T]>)[key] ?? key;
}

/** Translate a match reason/gap produced in English by the shared matcher. */
export function matchText(d: Dict, s: string): string {
  const m = d.labels.match as Record<string, string>;
  if (m[s]) return m[s];
  const n = s.match(/^Invests in (\d+) of your sectors$/);
  return n ? f(m["Invests in {n} of your sectors"], { n: n[1] }) : s;
}
