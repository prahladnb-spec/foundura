/** Shared shape of the sector guides that use `components/sector-guide.tsx` (small businesses, agritech). */
export type SectorStep = { title: string; body: string };
export type SectorFact = { t: string; d: string };

export type SectorText = {
  breadcrumb: string;
  title: string;
  lead: string;
  checked: string;
  stepsTitle: string;
  steps: SectorStep[];
  /** A boxed list of the figures or rules founders ask about most. */
  factsTitle: string;
  facts: SectorFact[];
  factsNote?: string;
  schemesTitle: string;
  schemesLead: string;
  scanLink: string;
  docsTitle: string;
  guidesTitle: string;
  investorsTitle: string;
  investorsBrowse: string;
  investorsEmpty: string;
  sourcesTitle: string;
};

export type SectorGuide = {
  key: "msme" | "agritech";
  checkedOn: string;
  /** Scheme slugs from the catalogue, in order. */
  schemes: string[];
  /** Template slugs, in order. */
  docs: string[];
  /** Guide (article) slugs, in order. */
  guides: string[];
  /** Investor sector filter, if any. */
  investorSector?: string;
  sources: { name: string; url: string }[];
  text: Record<"en" | "hi", SectorText>;
};
