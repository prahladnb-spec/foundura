import localFont from "next/font/local";

/*
 * The Latin display and body fonts, loaded through next/font so their files are preloaded with the page instead of
 * being discovered late from the stylesheet (late fonts reflowed the headlines and moved the page, Lighthouse CLS).
 * Only the basic Latin subsets are here; the @fontsource stylesheets in the layout still supply Latin Extended and
 * every other script, as later entries in the same font stacks (globals.css).
 */
export const anekLatin = localFont({
  src: "../../node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-wdth-normal.woff2",
  variable: "--font-anek-latin",
  weight: "100 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
  adjustFontFallback: false,
  fallback: [],
});

export const mukta = localFont({
  src: [
    { path: "../../node_modules/@fontsource/mukta/files/mukta-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/mukta/files/mukta-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mukta",
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
});
