import type { PageKey, PageSeo } from "../../seo";

/**
 * Everything a language needs besides its interface dictionary: SEO for the main pages, template
 * titles (t) and summaries (s), and glossary meanings (d) with a local name (n) where one is used.
 * Each language from Marathi on keeps all three in one file here.
 */
export interface LangContent {
  seo: Record<PageKey, Omit<PageSeo, "slug">>;
  docs: Record<string, { t: string; s: string }>;
  terms: Record<string, { n?: string; d: string }>;
}
