import type { IntlLang } from "../config";
import type { LangContent } from "./types";
import { gu } from "./gu";
import { te } from "./te";
import { ta } from "./ta";
import { kn } from "./kn";
import { mr } from "./mr";

/** Languages added after Spanish, German, Arabic and Hebrew (those four keep their older files). */
type Later = Exclude<IntlLang, "es" | "de" | "ar" | "he">;
export const CONTENT: Record<Later, LangContent> = {mr, kn, ta, te, gu };

export const contentOf = <K extends keyof LangContent>(key: K) =>
  Object.fromEntries(Object.entries(CONTENT).map(([l, c]) => [l, (c as LangContent)[key]])) as Record<Later, LangContent[K]>;
