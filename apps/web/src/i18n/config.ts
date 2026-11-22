/** Supported languages. English is served at the plain URLs, Hindi under /hi. */
export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** Locale for dates and numbers. Hindi uses Devanagari month names with Latin digits. */
export const INTL_LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN" };

/** Prefix an internal path for a language: lp("hi", "/scan") → "/hi/scan"; English stays as is. */
export function lp(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG || !path.startsWith("/") || path.startsWith("/api/") || path.startsWith("//")) return path;
  return path === "/" ? "/hi" : `/hi${path}`;
}

/** The same page in the other language. */
export function switchPath(pathname: string, to: Lang): string {
  const bare = pathname === "/hi" ? "/" : pathname.startsWith("/hi/") ? pathname.slice(3) : pathname;
  return lp(to, bare);
}

/** Replace {name} placeholders. */
export function f(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Pick singular or plural form; both may contain {n}. */
export function plural(n: number, one: string, many: string): string {
  return f(n === 1 ? one : many, { n });
}
