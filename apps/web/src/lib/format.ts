import { MONTHS, type Lang } from "@/i18n/config";

/** "2026-12-02" → "2 Dec 2026" / "2 दिस॰ 2026" (string-based, so no time-zone shifts). */
export function fmtDate(iso: string | null | undefined, withYear = true, lang: Lang = "en"): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[lang][m - 1]}${withYear ? ` ${y}` : ""}`;
}

/** "2–3 Dec 2026", "30 Nov – 2 Dec 2026", or one date. */
export function fmtRange(start: string | null, end: string | null, lang: Lang = "en"): string {
  if (!start) return "";
  if (!end || end === start) return fmtDate(start, true, lang);
  const [ys, ms] = start.split("-");
  const [ye, me] = end.split("-");
  if (ys === ye && ms === me) return `${Number(start.slice(8, 10))}–${fmtDate(end, true, lang)}`;
  if (ys === ye) return `${fmtDate(start, false, lang)} – ${fmtDate(end, true, lang)}`;
  return `${fmtDate(start, true, lang)} – ${fmtDate(end, true, lang)}`;
}


/**
 * `lang` for text people wrote themselves (startup names, descriptions), which may be English or
 * Hindi whatever the page language. Devanagari text follows the page; anything else is marked English
 * on Hindi pages so screen readers pronounce it properly.
 */
export function userTextLang(text: string | null | undefined, pageLang: Lang): "en" | undefined {
  if (pageLang === "en" || !text) return undefined;
  const script = { hi: /[\u0900-\u097f]/, ar: /[\u0600-\u06ff]/, he: /[\u0590-\u05ff]/ }[pageLang as "hi" | "ar" | "he"];
  // Spanish and German share the Latin script with English; founders mostly write in English.
  return script && script.test(text) ? undefined : "en";
}
