import "server-only";
import { en, type Dict } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { de } from "./de";
import { ar } from "./ar";
import { he } from "./he";
import type { Lang } from "./config";

export type { Dict };
export { f, plural, lab, matchText } from "./util";

const DICTS: Record<Lang, Dict> = { en, hi, es, de, ar, he };

/** The interface text for a language. Server only: client components get theirs from `useT()`. */
export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}
