import { financial } from "./financial";
import { fundraising } from "./fundraising";
import { legal } from "./legal";
import { team } from "./team";
import type { FounderDoc } from "./types";

export * from "./types";

export const DOCS: FounderDoc[] = [...fundraising, ...legal, ...financial, ...team];
export const docBySlug = (slug: string) => DOCS.find((d) => d.slug === slug);

/** The date the guides and templates were last checked against the law. Shown on every page and in every file. */
export const CHECKED_ON = "2026-11-22";

export const SOURCES = [
  { name: "Ministry of Corporate Affairs: Companies Act, 2013, rules and forms", url: "https://www.mca.gov.in/" },
  { name: "Startup India: recognition, benefits and pitch guidance", url: "https://www.startupindia.gov.in/" },
  { name: "India Code: Copyright Act, 1957; Indian Contract Act, 1872; Digital Personal Data Protection Act, 2023", url: "https://www.indiacode.nic.in/" },
  { name: "Ministry of Electronics and IT: IT Rules, 2021 and data protection rules", url: "https://www.meity.gov.in/" },
  { name: "Intellectual Property India: patents, trade marks and designs", url: "https://ipindia.gov.in/" },
];

export const GOALS = ["incorporate", "raise", "grant", "hire", "sell"] as const;
export type Goal = (typeof GOALS)[number];
export type Stage = "idea" | "prototype" | "early_revenue" | "growth";

/** Which documents to prepare first, and which next, for a goal at a stage. Slugs, in order. */
export function documentsFor(goal: Goal, stage: Stage): { first: string[]; next: string[] } {
  const early = stage === "idea" || stage === "prototype";
  switch (goal) {
    case "incorporate":
      return {
        first: ["founders-agreement", "incorporation-checklist", "first-board-minutes", "cap-table"],
        next: ["ip-assignment", "financial-records-checklist", "privacy-policy", "website-terms"],
      };
    case "raise":
      return early
        ? {
            first: ["pitch-deck", "one-pager", "cap-table", "financial-model"],
            next: ["founders-agreement", "ip-assignment", "term-sheet", "data-room-checklist"],
          }
        : {
            first: ["pitch-deck", "financial-model", "data-room-checklist", "cap-table", "case-study"],
            next: ["term-sheet", "shareholders-agreement-terms", "investor-update", "financial-records-checklist"],
          };
    case "grant":
      return {
        first: early ? ["business-plan-dpr", "one-pager", "financial-model"] : ["business-plan-dpr", "financial-model", "financial-records-checklist"],
        next: early ? ["incorporation-checklist", "letter-of-intent", "pitch-deck"] : ["letter-of-intent", "case-study", "one-pager"],
      };
    case "hire":
      return {
        first: ["offer-letter", "contractor-agreement", "ip-assignment"],
        next: early ? ["advisor-agreement", "nda", "hr-policies"] : ["esop-grant-letter", "hr-policies", "advisor-agreement"],
      };
    case "sell":
      return {
        first: early ? ["nda", "letter-of-intent", "one-pager"] : ["letter-of-intent", "case-study", "website-terms", "privacy-policy"],
        next: early ? ["privacy-policy", "website-terms", "case-study"] : ["nda", "contractor-agreement", "investor-update"],
      };
  }
}
