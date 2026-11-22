import type { Lang } from "@/i18n/config";
import { DOC_TEXT } from "./translations";
import type { FounderDoc } from "./types";

/**
 * A template's title and summary in a language. The template itself is English; titles and
 * summaries exist in every interface language. `en` says the text fell back to English.
 */
export function docText(d: Pick<FounderDoc, "slug" | "title" | "titleHi" | "summary" | "summaryHi">, lang: Lang): { title: string; summary: string; en: boolean } {
  if (lang === "en") return { title: d.title, summary: d.summary, en: false };
  if (lang === "hi") return { title: d.titleHi, summary: d.summaryHi, en: false };
  const x = DOC_TEXT[lang][d.slug];
  return x ? { title: x.t, summary: x.s, en: false } : { title: d.title, summary: d.summary, en: true };
}
