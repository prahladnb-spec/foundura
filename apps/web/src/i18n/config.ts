/**
 * Supported languages. English is served at the plain URLs; every other language lives under
 * /<code>/... (/hi, /es, /de, /ar, /he). Add a language here, give it a dictionary the same shape
 * as en.ts, and the routing, alternates, sitemap and language menu pick it up.
 */
export const LANGS = ["en", "hi", "es", "de", "ar", "he"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

export interface LangInfo {
  /** The language's own name, as the language menu shows it. */
  name: string;
  /** For <html lang>, hreflang and lang attributes. */
  tag: string;
  dir: "ltr" | "rtl";
  /** For Open Graph: language_TERRITORY. */
  og: string;
  /** Sentence end, for text joined from parts. */
  stop: string;
}

export const LANG_INFO: Record<Lang, LangInfo> = {
  en: { name: "English", tag: "en-IN", dir: "ltr", og: "en_IN", stop: "." },
  hi: { name: "हिन्दी", tag: "hi-IN", dir: "ltr", og: "hi_IN", stop: "।" },
  es: { name: "Español", tag: "es", dir: "ltr", og: "es_ES", stop: "." },
  de: { name: "Deutsch", tag: "de", dir: "ltr", og: "de_DE", stop: "." },
  ar: { name: "العربية", tag: "ar", dir: "rtl", og: "ar_AR", stop: "." },
  he: { name: "עברית", tag: "he", dir: "rtl", og: "he_IL", stop: "." },
};

/** Locale for Intl dates and numbers. Latin digits everywhere, as on the Hindi site. */
export const INTL_LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", es: "es-ES", de: "de-DE", ar: "ar-u-nu-latn", he: "he-IL" };

/** Short month names for dates written as "2 Dec 2026", without loading a whole dictionary. */
export const MONTHS: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hi: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्टू॰", "नव॰", "दिस॰"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  he: ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"],
};

const PREFIX = new RegExp(`^/(${LANGS.filter((l) => l !== DEFAULT_LANG).join("|")})(?=/|$)`);

/** The language a visible path belongs to: "/es/scan" → "es", "/scan" → "en". */
export function langOfPath(pathname: string): Lang {
  const m = pathname.match(PREFIX);
  return m ? (m[1] as Lang) : DEFAULT_LANG;
}

/** A visible path without its language prefix: "/es/scan" → "/scan", "/es" → "/". */
export function stripLang(pathname: string): string {
  return pathname.replace(PREFIX, "") || "/";
}

/** Prefix an internal path for a language: lp("hi", "/scan") → "/hi/scan"; English stays as is. */
export function lp(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG || !path.startsWith("/") || path.startsWith("/api/") || path.startsWith("//")) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** The same page in another language. */
export function switchPath(pathname: string, to: Lang): string {
  return lp(to, stripLang(pathname));
}

/** Replace {name} placeholders. */
export function f(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Pick singular or plural form; both may contain {n}. */
export function plural(n: number, one: string, many: string): string {
  return f(n === 1 ? one : many, { n });
}

/**
 * For content written only in English and Hindi (guides, the MedTech guide, legal pages, scheme
 * details): Hindi pages get Hindi, every other language gets English, marked lang="en".
 */
export const contentLang = (l: Lang): "en" | "hi" => (l === "hi" ? "hi" : "en");
