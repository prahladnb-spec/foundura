import type { StateTile } from "../funding/directory";

/**
 * DPIIT's States' Startup Ranking 5.0, announced on 16 January 2026, covering 34 states and union territories.
 * It rates each government's support for startups (policy, incubation, funding, market access), not how many
 * startups a state has. Jharkhand and West Bengal did not take part. Update when the next edition is published.
 */
export const RANKING = {
  edition: "5.0",
  announced: "2026-01-16",
  source: "https://www.startupindia.gov.in/srf/portal/edition_5th_2026.html",
};

export type Tier = "best" | "top" | "leader" | "aspiring" | "emerging";
export const TIERS: Tier[] = ["best", "top", "leader", "aspiring", "emerging"];

export const STATE_TIER: Partial<Record<StateTile, Tier>> = {
  GJ: "best", AR: "best", GA: "best",
  KA: "top", PB: "top", TN: "top", UP: "top", HP: "top",
  RJ: "leader", KL: "leader", MP: "leader", UT: "leader", TG: "leader", MH: "leader", AP: "leader", HR: "leader", MN: "leader", NL: "leader", ML: "leader",
  AS: "aspiring", OR: "aspiring", BR: "aspiring", JK: "aspiring", SK: "aspiring", TR: "aspiring", MZ: "aspiring", AN: "aspiring",
  CT: "emerging", DL: "emerging", PY: "emerging", CH: "emerging", DH: "emerging", LD: "emerging", LA: "emerging",
};

/** How strongly a map tile is tinted: the better DPIIT's rating, the deeper the marigold. */
export const TIER_SHADE: Record<Tier, number> = { best: 1, top: 0.8, leader: 0.62, aspiring: 0.46, emerging: 0.32 };
