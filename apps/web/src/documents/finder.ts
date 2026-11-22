/** The documents finder's rules, kept apart from the document content so the browser only gets this. */
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
