import type { Lang } from "@/i18n/config";

/*
 * The fonts each language needs first, preloaded with the page so headlines don't reflow when a late font
 * arrives (Lighthouse CLS) and so a page never spends its first bandwidth on another script's font. The
 * stylesheets (@fontsource imports in the layout and the Hindi faces in globals.css) still declare every face;
 * these URLs point at the same built files, so nothing downloads twice. Japanese uses the phone's own fonts.
 */
const latin = [
  new URL("../../node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-wdth-normal.woff2", import.meta.url),
  new URL("../../node_modules/@fontsource/mukta/files/mukta-latin-400-normal.woff2", import.meta.url),
  new URL("../../node_modules/@fontsource/mukta/files/mukta-latin-600-normal.woff2", import.meta.url),
];
const devanagari = [
  new URL("../fonts/anek-devanagari-bold-narrow.woff2", import.meta.url),
  new URL("../fonts/anek-devanagari-bold-narrow-latin.woff2", import.meta.url),
];

const FIRST_FONTS: Record<Lang, URL[]> = {
  en: latin,
  es: latin,
  de: latin,
  fr: latin,
  pt: latin,
  hi: devanagari,
  mr: devanagari,
  kn: [new URL("../../node_modules/@fontsource-variable/anek-kannada/files/anek-kannada-kannada-wght-normal.woff2", import.meta.url)],
  ta: [new URL("../../node_modules/@fontsource-variable/anek-tamil/files/anek-tamil-tamil-wght-normal.woff2", import.meta.url)],
  te: [new URL("../../node_modules/@fontsource-variable/anek-telugu/files/anek-telugu-telugu-wght-normal.woff2", import.meta.url)],
  gu: [new URL("../../node_modules/@fontsource-variable/anek-gujarati/files/anek-gujarati-gujarati-wght-normal.woff2", import.meta.url)],
  bn: [new URL("../../node_modules/@fontsource-variable/anek-bangla/files/anek-bangla-bengali-wght-normal.woff2", import.meta.url)],
  ml: [new URL("../../node_modules/@fontsource-variable/anek-malayalam/files/anek-malayalam-malayalam-wght-normal.woff2", import.meta.url)],
  ar: [new URL("../../node_modules/@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-wght-normal.woff2", import.meta.url)],
  he: [new URL("../../node_modules/@fontsource-variable/noto-sans-hebrew/files/noto-sans-hebrew-hebrew-wdth-normal.woff2", import.meta.url)],
  ja: [],
};

/** <link rel="preload"> tags for the language's first fonts, for the root layout's <head>. */
export function FontPreloads({ lang }: { lang: Lang }) {
  return FIRST_FONTS[lang].map((url) => (
    <link key={url.pathname} rel="preload" href={url.pathname} as="font" type="font/woff2" crossOrigin="anonymous" />
  ));
}
