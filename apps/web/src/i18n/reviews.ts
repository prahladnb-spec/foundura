import type { Lang } from "./config";

/**
 * Native-speaker checks of each translation. Like REVIEWS for templates: fill an entry in only
 * after a real review. Until then the language's pages carry a note asking for corrections.
 * English is the source and Hindi was written alongside it, so neither is listed.
 */
export const TRANSLATION_REVIEWS: Partial<Record<Lang, { by: string; on: string } | null>> = {
  es: null,
  de: null,
  ar: null,
  he: null,
  gu: null,
  te: null,
  ta: null,
  kn: null,
  mr: null,
};

export const awaitingReview = (lang: Lang) => lang in TRANSLATION_REVIEWS && !TRANSLATION_REVIEWS[lang];
