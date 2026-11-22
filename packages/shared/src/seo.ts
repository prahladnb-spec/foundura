/**
 * Search checks for anything Foundura publishes: the limits search results display well within,
 * and whether the focus keyphrase is where it should be. Used by the article editor (live) and tests.
 */
export const SEO_LIMITS = { title: 60, descriptionMin: 120, descriptionMax: 160, excerptWords: 50, keywords: 15, slugWords: 6 } as const;

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** Characters as people see them (so Devanagari isn't over-counted). */
export const charCount = (s: string) => [...s].length;

export interface SeoFields {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  focusKeyphrase: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface SeoCheck {
  id: string;
  ok: boolean;
  label: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const has = (text: string, phrase: string) => phrase.length > 0 && ` ${norm(text)} `.includes(` ${norm(phrase)} `);

export function seoChecks(a: SeoFields): SeoCheck[] {
  const L = SEO_LIMITS;
  const focus = a.focusKeyphrase.trim();
  const title = a.seoTitle.trim() || a.title;
  const firstPara = a.body.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith("#")) ?? "";
  const slugWords = a.slug.split("-").filter(Boolean);
  const dLen = charCount(a.metaDescription.trim());
  return [
    { id: "focus", ok: focus.length > 0, label: "A focus keyphrase is set" },
    { id: "focus-title", ok: has(title, focus), label: "The focus keyphrase is in the SEO title" },
    {
      id: "focus-title-start",
      ok: has(title.slice(0, Math.ceil(title.length / 2)), focus) || norm(title).startsWith(norm(focus)),
      label: "The focus keyphrase comes early in the SEO title",
    },
    { id: "focus-description", ok: has(a.metaDescription, focus), label: "The focus keyphrase is in the meta description" },
    { id: "focus-slug", ok: focus.length > 0 && norm(focus).split(" ").some((w) => w.length > 2 && slugWords.includes(w)), label: "The slug uses words from the focus keyphrase" },
    { id: "focus-intro", ok: has(firstPara, focus), label: "The focus keyphrase is in the first paragraph" },
    { id: "title-length", ok: charCount(title) > 0 && charCount(title) <= L.title, label: `The SEO title is ${L.title} characters or fewer` },
    { id: "description-length", ok: dLen >= L.descriptionMin && dLen <= L.descriptionMax, label: `The meta description is ${L.descriptionMin} to ${L.descriptionMax} characters` },
    { id: "excerpt-length", ok: wordCount(a.excerpt) > 0 && wordCount(a.excerpt) <= L.excerptWords, label: `The excerpt is ${L.excerptWords} words or fewer` },
    { id: "keywords", ok: new Set(a.keywords.map(norm)).size === L.keywords, label: `${L.keywords} different keywords` },
    { id: "slug-short", ok: slugWords.length > 0 && slugWords.length <= L.slugWords, label: `The slug is short (${L.slugWords} words or fewer)` },
  ];
}
