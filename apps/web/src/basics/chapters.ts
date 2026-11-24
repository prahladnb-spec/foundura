import { EN } from "./text-en";
import { HI } from "./text-hi";
import type { Chapter, ChapterText } from "./types";

/**
 * Funding basics: a short course at /basics, in English and Hindi (other languages show the English).
 * The Indian rules in "india-rules", "equity" and "vc" were checked against official notices and
 * law-firm summaries on CHECKED_ON; when any of them changes, update both languages and the date.
 * General information only: the pages say so and point to a CA or lawyer.
 */
export const CHECKED_ON = "2026-11-24";

type Meta = Omit<Chapter, "en" | "hi">;
const META: Meta[] = [
  { slug: "stages", terms: ["MVP", "Product-market fit", "Traction", "Bootstrapping"], docs: ["lean-canvas", "customer-interview-script"], links: ["scan"] },
  { slug: "rounds", terms: ["Seed round", "Angel investor", "Venture capital (VC)", "Runway", "Accelerator", "Incubator"], docs: ["pitch-deck", "investor-pipeline"], links: ["funding"] },
  { slug: "equity", terms: ["Equity", "CCPS", "Convertible note", "SAFE and iSAFE", "Valuation cap", "Cap table"], docs: ["convertible-note", "cap-table", "shareholders-agreement-terms"], links: ["funding", "investors"] },
  { slug: "debt", terms: ["Runway", "Burn rate", "Unit economics"], docs: ["financial-model", "budget-use-of-funds"], links: ["schemes", "funding"] },
  { slug: "grants", terms: ["DPIIT recognition", "Incubator"], docs: ["grant-reporting-pack", "business-plan-dpr", "budget-use-of-funds"], links: ["scan", "schemes", "funding"] },
  { slug: "vc", terms: ["Venture capital (VC)", "Angel investor", "Due diligence", "Term sheet", "Data room", "Exit"], docs: ["pitch-deck", "one-pager", "data-room-checklist", "investor-update"], links: ["funding", "investors"] },
  { slug: "valuation", terms: ["Pre-money and post-money valuation", "Dilution", "Fully diluted", "ESOP", "Cap table"], docs: ["cap-table", "esop-scheme"], links: ["funding"], calculator: true },
  { slug: "term-sheet", terms: ["Term sheet", "Liquidation preference", "Anti-dilution", "Vesting", "Cliff", "Pro rata right", "Right of first refusal (ROFR)", "Tag-along", "Drag-along"], docs: ["term-sheet", "shareholders-agreement-terms", "founders-agreement"], links: ["investors"] },
  { slug: "india-rules", terms: ["DPIIT recognition", "Private placement", "CCPS", "ESOP"], docs: ["resolutions-pack", "incorporation-checklist", "esop-scheme"], links: ["schemes", "scan"] },
  { slug: "choosing", terms: ["Runway", "Burn rate", "Cap table"], docs: ["financial-model", "investor-update", "investor-pipeline"], links: ["funding", "scan", "investors"] },
];

export const CHAPTERS: Chapter[] = META.map((m) => {
  const en = EN[m.slug];
  const hi = HI[m.slug];
  if (!en || !hi) throw new Error(`Funding basics chapter "${m.slug}" needs English and Hindi text`);
  return { ...m, en, hi };
});

export const chapterBySlug = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
export const chapterText = (c: Chapter, lang: "en" | "hi"): ChapterText => c[lang];
