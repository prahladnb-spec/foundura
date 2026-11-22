import "server-only";
import type { Dict } from "./en";
import { DICTS } from "./dicts";
import type { Lang } from "./config";

export type { Dict };
export { f, plural, lab, matchText } from "./util";

/** The interface text for a language. Server only: client components get theirs from `useT()`. */
export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}
