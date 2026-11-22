/**
 * Supported languages. English is served at the plain URLs; every other language lives under
 * /<code>/... (/hi, /es, /de, /ar, /he). Add a language here, give it a dictionary the same shape
 * as en.ts, and the routing, alternates, sitemap and language menu pick it up.
 */
export const LANGS = ["en", "hi", "es", "de", "ar", "he", "mr", "kn", "ta", "te", "gu"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** Languages whose page SEO, template titles and glossary come from per-language files (not en/hi). */
export type IntlLang = Exclude<Lang, "en" | "hi">;

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
  /** Letters of the language's own script, for languages not written in Latin letters. */
  script?: RegExp;
  /** The menu labels are too wide for one header row on a laptop, so the menu row shows until 2xl. */
  wideNav?: boolean;
}

export const LANG_INFO: Record<Lang, LangInfo> = {
  en: { name: "English", tag: "en-IN", dir: "ltr", og: "en_IN", stop: "." },
  hi: { name: "हिन्दी", tag: "hi-IN", dir: "ltr", og: "hi_IN", stop: "।", script: /[\u0900-\u097f]/ },
  es: { name: "Español", tag: "es", dir: "ltr", og: "es_ES", stop: "." },
  de: { name: "Deutsch", tag: "de", dir: "ltr", og: "de_DE", stop: "." },
  ar: { name: "العربية", tag: "ar", dir: "rtl", og: "ar_AR", stop: ".", script: /[\u0600-\u06ff]/ },
  he: { name: "עברית", tag: "he", dir: "rtl", og: "he_IL", stop: ".", script: /[\u0590-\u05ff]/ },
  mr: { name: "मराठी", tag: "mr-IN", dir: "ltr", og: "mr_IN", stop: ".", script: /[\u0900-\u097f]/ },
  kn: { name: "ಕನ್ನಡ", tag: "kn-IN", dir: "ltr", og: "kn_IN", stop: ".", script: /[\u0c80-\u0cff]/, wideNav: true },
  ta: { name: "தமிழ்", tag: "ta-IN", dir: "ltr", og: "ta_IN", stop: ".", script: /[\u0b80-\u0bff]/, wideNav: true },
  te: { name: "తెలుగు", tag: "te-IN", dir: "ltr", og: "te_IN", stop: ".", script: /[\u0c00-\u0c7f]/, wideNav: true },
  gu: { name: "ગુજરાતી", tag: "gu-IN", dir: "ltr", og: "gu_IN", stop: ".", script: /[\u0a80-\u0aff]/ },
};

/** Locale for Intl dates and numbers. Latin digits everywhere, as on the Hindi site. */
export const INTL_LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", es: "es-ES", de: "de-DE", ar: "ar-u-nu-latn", he: "he-IL", mr: "mr-IN-u-nu-latn", kn: "kn-IN-u-nu-latn", ta: "ta-IN-u-nu-latn", te: "te-IN-u-nu-latn", gu: "gu-IN-u-nu-latn" };

/** Short month names for dates written as "2 Dec 2026", without loading a whole dictionary. */
export const MONTHS: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hi: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्टू॰", "नव॰", "दिस॰"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  he: ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"],
  mr: ["जाने.", "फेब्रु.", "मार्च", "एप्रि.", "मे", "जून", "जुलै", "ऑग.", "सप्टें.", "ऑक्टो.", "नोव्हें.", "डिसें."],
  kn: ["ಜನ.", "ಫೆಬ್ರ.", "ಮಾರ್ಚ್", "ಏಪ್ರಿ.", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗ.", "ಸೆಪ್ಟೆಂ.", "ಅಕ್ಟೋ.", "ನವೆಂ.", "ಡಿಸೆಂ."],
  ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
  te: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
  gu: ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"],
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
