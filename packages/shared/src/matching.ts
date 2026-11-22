/**
 * Founder–investor match score (0–100) with plain-language reasons.
 * Deterministic and explainable: sector, stage, geography and cheque size.
 */

export interface MatchStartup {
  sectors: string[];
  stage?: string | null;
  state?: string | null;
  raisingInrLakh?: number | null;
}

export interface MatchInvestor {
  sectors: string[];
  stages: string[];
  /** Empty = invests across India. */
  states: string[];
  chequeMinInrLakh: number;
  chequeMaxInrLakh: number;
}

export interface MatchResult {
  score: number;
  reasons: string[];
  gaps: string[];
}

const WEIGHTS = { sector: 40, stage: 30, geography: 15, cheque: 15 } as const;

export function matchScore(s: MatchStartup, inv: MatchInvestor): MatchResult {
  const reasons: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const shared = s.sectors.filter((x) => inv.sectors.includes(x));
  if (shared.length > 0) {
    score += WEIGHTS.sector;
    reasons.push(shared.length === 1 ? "Invests in your sector" : `Invests in ${shared.length} of your sectors`);
  } else {
    gaps.push(s.sectors.length ? "Different sector focus" : "Add your sectors to compare focus");
  }

  if (s.stage && inv.stages.includes(s.stage)) {
    score += WEIGHTS.stage;
    reasons.push("Backs startups at your stage");
  } else {
    gaps.push(s.stage ? "Usually invests at a different stage" : "Add your stage to compare");
  }

  if (inv.states.length === 0) {
    score += WEIGHTS.geography;
    reasons.push("Invests across India");
  } else if (s.state && inv.states.includes(s.state)) {
    score += WEIGHTS.geography;
    reasons.push("Invests in your state");
  } else {
    gaps.push(s.state ? "Focuses on other states" : "Add your state to compare");
  }

  const ask = s.raisingInrLakh;
  if (typeof ask === "number" && ask > 0) {
    if (ask >= inv.chequeMinInrLakh && ask <= inv.chequeMaxInrLakh * 4) {
      // A single investor often takes part of a round, so allow rounds up to 4× the max cheque.
      score += WEIGHTS.cheque;
      reasons.push("Cheque size fits your round");
    } else {
      gaps.push(ask < inv.chequeMinInrLakh ? "Your round is smaller than their usual cheque" : "Your round is much larger than their cheques");
    }
  } else {
    gaps.push("Add how much you are raising to compare cheque size");
  }

  return { score, reasons, gaps };
}
