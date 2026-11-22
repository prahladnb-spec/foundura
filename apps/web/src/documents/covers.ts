/**
 * Templates with a drawn cover (public/art/covers/<slug>.svg), in the order the templates page
 * shelves them: raising money first, then agreements, the first hires, and the idea stage.
 * Covers carry no words, so they suit both languages.
 */
export const COVERS = [
  "pitch-deck",
  "one-pager",
  "financial-model",
  "cap-table",
  "business-plan-dpr",
  "data-room-checklist",
  "founders-agreement",
  "term-sheet",
  "nda",
  "esop-scheme",
  "offer-letter",
  "lean-canvas",
] as const;

export const hasCover = (slug: string) => (COVERS as readonly string[]).includes(slug);
export const coverSrc = (slug: string) => `/art/covers/${slug}.svg`;
