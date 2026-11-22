import { createHash } from "node:crypto";
import { visibleConditionLabels, type Condition, type Locale } from "@foundura/shared";
import type { Scheme, SchemeTranslation } from "../db/schema";

type EnglishText = Pick<Scheme, "name" | "summary" | "benefits" | "howToApply" | "alsoCheck" | "statusNote" | "rule">;

/** Fingerprint of everything a translation covers. Changes whenever the English text or condition labels change. */
export function englishFingerprint(s: EnglishText): string {
  const payload = JSON.stringify([
    s.name,
    s.summary,
    s.benefits,
    s.howToApply,
    s.alsoCheck,
    s.statusNote ?? null,
    visibleConditionLabels(s.rule as Condition),
  ]);
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export type TranslationStatus = "missing" | "current" | "outdated";

export function translationStatus(s: Scheme, lang: Exclude<Locale, "en">): TranslationStatus {
  const t = s.translations?.[lang];
  if (!t) return "missing";
  return t.sourceHash === englishFingerprint(s) ? "current" : "outdated";
}

/** The translation to show, or null when it's missing or written for older English. */
export function usableTranslation(s: Scheme, lang: Locale): SchemeTranslation | null {
  if (lang === "en") return null;
  return translationStatus(s, lang) === "current" ? s.translations[lang]! : null;
}

/** Scheme text in the requested language, falling back to English. `contentLang` says which was used. */
export function localizeScheme<S extends Scheme>(s: S, lang: Locale) {
  const t = usableTranslation(s, lang);
  const { translations: _drop, ...rest } = s;
  if (!t) return { ...rest, contentLang: "en" as Locale };
  return {
    ...rest,
    name: t.name,
    summary: t.summary,
    benefits: t.benefits,
    howToApply: t.howToApply,
    alsoCheck: t.alsoCheck,
    statusNote: t.statusNote,
    contentLang: lang,
  };
}

/** Translate scan result lines (English condition labels) when a current translation exists. */
export function localizeLabels(s: Scheme, lang: Locale, labels: string[]): string[] {
  const t = usableTranslation(s, lang);
  return t ? labels.map((l) => t.labels[l] ?? l) : labels;
}
