import type { JourneyStep } from "@foundura/shared/constants";

/**
 * Where each progress-tracker step points: a template (by slug) or a page on Foundura.
 * Labels are in the dictionaries (`progress.steps`). Keep in step with JOURNEY in @foundura/shared.
 */
export const STEP_LINKS: Partial<Record<JourneyStep, { doc: string } | { page: string }>> = {
  "idea.problem": { page: "/basics/stages" },
  "idea.canvas": { doc: "lean-canvas" },
  "validation.interviews": { doc: "customer-interview-script" },
  "validation.competitors": { doc: "competitor-comparison" },
  "validation.loi": { doc: "letter-of-intent" },
  "setup.incorporate": { doc: "incorporation-checklist" },
  "setup.founders": { doc: "founders-agreement" },
  "setup.dpiit": { page: "/scan" },
  "mvp.ip": { doc: "ip-assignment" },
  "mvp.trademark": { doc: "trademark-checklist" },
  "launch.customers": { doc: "customer-agreement" },
  "launch.invoice": { doc: "quotation-and-invoice" },
  "launch.privacy": { doc: "privacy-policy" },
  "pmf.model": { doc: "financial-model" },
  "pmf.deck": { doc: "pitch-deck" },
  "growth.raise": { page: "/funding" },
  "growth.esop": { doc: "esop-scheme" },
  "growth.updates": { page: "/investor-update" },
  "mature.board": { doc: "first-board-minutes" },
  "mature.records": { doc: "financial-records-checklist" },
  "mature.exit": { doc: "exit-checklist" },
};
