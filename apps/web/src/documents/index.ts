import { corporate } from "./corporate";
import { financial } from "./financial";
import { fundraising } from "./fundraising";
import { legal } from "./legal";
import { planning } from "./planning";
import { team } from "./team";
import { tools } from "./tools";
import type { FounderDoc } from "./types";
import { withVariants } from "./variants";

export * from "./types";

export const DOCS: FounderDoc[] = withVariants([...planning, ...fundraising, ...legal, ...financial, ...team, ...corporate, ...tools]);
export const docBySlug = (slug: string) => DOCS.find((d) => d.slug === slug);

/** The date the guides and templates were last updated. Shown on every page and in every file. */
export const CHECKED_ON = "2026-11-22";

/**
 * A review by a practising professional. Fill these in only after the review has actually happened,
 * with the reviewer's consent to be named. While a review is null, no page or file claims one.
 */
export interface Review {
  /** For example "Adv. Priya Rao" or "CA Rahul Mehta". */
  by: string;
  /** For example "Advocate, Bar Council of Karnataka" or "Chartered Accountant, ICAI membership no. 123456". */
  qualification: string;
  /** ISO date of the review. */
  on: string;
}
export const REVIEWS: { legal: Review | null; ca: Review | null } = { legal: null, ca: null };

/** Documents that touch tax, accounts, filings or money, which a chartered accountant should check. */
const CA_DOCS = new Set([
  "incorporation-checklist",
  "business-plan-dpr",
  "grant-reporting-pack",
  "budget-use-of-funds",
  "esop-scheme",
  "esop-grant-letter",
  "offer-letter",
  "exit-checklist",
]);

/** Which professionals should check a document before anyone relies on it. */
export function checkWith(d: FounderDoc): { lawyer: boolean; ca: boolean } {
  return { lawyer: d.lawyer, ca: d.category === "financial" || CA_DOCS.has(d.slug) };
}

/** The reviews that cover a document, in the order they apply. */
export function reviewsFor(d: FounderDoc): Review[] {
  const c = checkWith(d);
  return [c.lawyer ? REVIEWS.legal : null, c.ca ? REVIEWS.ca : null].filter((r): r is Review => r !== null);
}

export const SOURCES = [
  { name: "Ministry of Corporate Affairs: Companies Act, 2013, rules and forms", url: "https://www.mca.gov.in/" },
  { name: "Startup India: recognition, benefits and pitch guidance", url: "https://www.startupindia.gov.in/" },
  { name: "India Code: Copyright Act, 1957; Indian Contract Act, 1872; Digital Personal Data Protection Act, 2023", url: "https://www.indiacode.nic.in/" },
  { name: "Ministry of Electronics and IT: IT Rules, 2021 and data protection rules", url: "https://www.meity.gov.in/" },
  { name: "Intellectual Property India: patents, trade marks and designs", url: "https://ipindia.gov.in/" },
];

export const GOALS = ["validate", "incorporate", "raise", "grant", "hire", "sell"] as const;
export type Goal = (typeof GOALS)[number];
export type Stage = "idea" | "prototype" | "early_revenue" | "growth";

/** Which documents to prepare first, and which next, for a goal at a stage. Slugs, in order. */
export function documentsFor(goal: Goal, stage: Stage): { first: string[]; next: string[] } {
  const early = stage === "idea" || stage === "prototype";
  switch (goal) {
    case "validate":
      return {
        first: ["lean-canvas", "customer-interview-script", "competitor-comparison"],
        next: early ? ["one-pager", "trademark-checklist", "founders-agreement"] : ["go-to-market-plan", "case-study", "trademark-checklist"],
      };
    case "incorporate":
      return {
        first: ["founders-agreement", "incorporation-checklist", "first-board-minutes", "cap-table"],
        next: ["ip-assignment", "trademark-checklist", "financial-records-checklist", "resolutions-pack"],
      };
    case "raise":
      return early
        ? {
            first: ["pitch-deck", "one-pager", "cap-table", "financial-model"],
            next: ["investor-pipeline", "founders-agreement", "ip-assignment", "term-sheet", "convertible-note"],
          }
        : {
            first: ["pitch-deck", "financial-model", "data-room-checklist", "cap-table", "case-study"],
            next: ["investor-pipeline", "due-diligence-questions", "term-sheet", "shareholders-agreement-terms", "investor-update"],
          };
    case "grant":
      return {
        first: early ? ["business-plan-dpr", "budget-use-of-funds", "one-pager", "financial-model"] : ["business-plan-dpr", "budget-use-of-funds", "financial-model", "financial-records-checklist"],
        next: early ? ["incorporation-checklist", "letter-of-intent", "grant-reporting-pack"] : ["letter-of-intent", "case-study", "grant-reporting-pack"],
      };
    case "hire":
      return {
        first: ["offer-letter", "contractor-agreement", "ip-assignment"],
        next: early ? ["internship-letter", "advisor-agreement", "hr-policies"] : ["esop-scheme", "esop-grant-letter", "hr-policies", "appraisal-form"],
      };
    case "sell":
      return {
        first: early ? ["go-to-market-plan", "nda", "letter-of-intent", "one-pager"] : ["go-to-market-plan", "customer-agreement", "quotation-and-invoice", "case-study"],
        next: early ? ["quotation-and-invoice", "privacy-policy", "website-terms"] : ["data-processing-agreement", "privacy-policy", "website-terms", "vendor-agreement"],
      };
  }
}
