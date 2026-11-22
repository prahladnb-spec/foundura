import { docBySlug } from "./index";

/**
 * Templates that may help when applying, by scheme category. "May help", not "required": the
 * official source says what each scheme actually asks for.
 */
const BY_CATEGORY: Record<string, string[]> = {
  grant: ["business-plan-dpr", "budget-use-of-funds", "grant-reporting-pack"],
  loan: ["business-plan-dpr", "financial-model"],
  fund: ["pitch-deck", "financial-model", "cap-table"],
  tax: ["financial-records-checklist"],
  recognition: ["incorporation-checklist"],
  regulatory: ["incorporation-checklist"],
  ipr: ["trademark-checklist", "ip-assignment"],
  procurement: ["quotation-and-invoice", "case-study"],
  state_policy: ["business-plan-dpr", "incorporation-checklist"],
};

export type HelpLink = { slug: string; title: string; kind: "doc" | "sheet" | "deck" };
export type HelpMap = Record<string, HelpLink[]>;

/** The map for one language, with only what the scan results need to show the links. */
export function schemeHelp(lang: "en" | "hi"): HelpMap {
  return Object.fromEntries(
    Object.entries(BY_CATEGORY).map(([cat, slugs]) => [
      cat,
      slugs.map((slug) => {
        const d = docBySlug(slug);
        if (!d) throw new Error(`scheme-help: no template ${slug}`);
        return { slug, title: lang === "hi" ? d.titleHi : d.title, kind: d.template.kind };
      }),
    ]),
  );
}
