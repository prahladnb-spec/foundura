import type { ScanInput } from "./schemas";

/**
 * Scheme eligibility rules engine.
 *
 * Rules are plain JSON so they can live in the database and be reviewed by an
 * editor. Evaluation is three-valued: a condition is "met", "unmet" or
 * "unknown" (when the answer it needs is missing). The engine never guesses:
 * a scheme is only "eligible" when every condition is met.
 */

/** Facts a rule can test: the scan answers plus values derived from them. */
export type FactKey =
  | keyof ScanInput
  | "ageYears";

export type Operator =
  | "eq"
  | "neq"
  | "in"
  | "nin"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "isTrue"
  | "isFalse"
  | "includesAny";

export interface FactCondition {
  fact: FactKey;
  op: Operator;
  value?: string | number | boolean | Array<string | number>;
  /** Plain-language statement of the condition, shown to the founder. */
  label: string;
}

export interface AllCondition {
  all: Condition[];
  label?: string;
}
export interface AnyCondition {
  any: Condition[];
  label?: string;
}

export type Condition = FactCondition | AllCondition | AnyCondition;

export type Truth = "met" | "unmet" | "unknown";

export interface ConditionResult {
  label: string;
  result: Truth;
}

export type EligibilityStatus = "eligible" | "maybe" | "not_eligible";

export interface EligibilityResult {
  status: EligibilityStatus;
  met: string[];
  unmet: string[];
  unknown: string[];
}

export type Facts = ScanInput & { ageYears?: number };

/** Whole years between an ISO date and `today` (also ISO). */
export function yearsSince(isoDate: string, today: string): number {
  const [y1, m1, d1] = isoDate.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  let years = y2 - y1;
  if (m2 < m1 || (m2 === m1 && d2 < d1)) years -= 1;
  return years;
}

/** Fractional years, used for "not older than N years" tests so that 10y 2m counts as over 10. */
export function exactYearsSince(isoDate: string, today: string): number {
  const ms = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${isoDate}T00:00:00Z`);
  return ms / (365.2425 * 24 * 3600 * 1000);
}

export function deriveFacts(input: ScanInput, today: string): Facts {
  const facts: Facts = { ...input };
  if (input.incorporationDate) {
    facts.ageYears = exactYearsSince(input.incorporationDate, today);
  }
  return facts;
}

function isFact(c: Condition): c is FactCondition {
  return (c as FactCondition).fact !== undefined;
}

function evalFact(c: FactCondition, facts: Facts): Truth {
  const raw = facts[c.fact as keyof Facts] as unknown;
  if (raw === undefined || raw === null || (Array.isArray(raw) && raw.length === 0 && c.op === "includesAny")) {
    return "unknown";
  }
  const v = c.value;
  const ok = (b: boolean): Truth => (b ? "met" : "unmet");
  switch (c.op) {
    case "eq":
      return ok(raw === v);
    case "neq":
      return ok(raw !== v);
    case "in":
      return ok(Array.isArray(v) && (v as unknown[]).includes(raw));
    case "nin":
      return ok(Array.isArray(v) && !(v as unknown[]).includes(raw));
    case "gt":
      return ok(typeof raw === "number" && raw > (v as number));
    case "gte":
      return ok(typeof raw === "number" && raw >= (v as number));
    case "lt":
      return ok(typeof raw === "number" && raw < (v as number));
    case "lte":
      return ok(typeof raw === "number" && raw <= (v as number));
    case "isTrue":
      return ok(raw === true);
    case "isFalse":
      return ok(raw === false);
    case "includesAny":
      return ok(Array.isArray(raw) && Array.isArray(v) && raw.some((x) => (v as unknown[]).includes(x)));
    default:
      return "unknown";
  }
}

/** Evaluate a condition tree; collects a result line for each labelled node. */
export function evaluate(condition: Condition, facts: Facts, out: ConditionResult[] = []): Truth {
  if (isFact(condition)) {
    const r = evalFact(condition, facts);
    out.push({ label: condition.label, result: r });
    return r;
  }

  const isAll = "all" in condition;
  const children = isAll ? condition.all : condition.any;
  // A labelled group reports as one line; an unlabelled group reports its children.
  const childOut: ConditionResult[] = [];
  const results = children.map((c) => evaluate(c, facts, childOut));

  let r: Truth;
  if (isAll) {
    r = results.includes("unmet") ? "unmet" : results.includes("unknown") ? "unknown" : "met";
  } else {
    r = results.includes("met") ? "met" : results.includes("unknown") ? "unknown" : "unmet";
  }

  if (condition.label) {
    out.push({ label: condition.label, result: r });
  } else {
    out.push(...childOut);
  }
  return r;
}

export function checkEligibility(rule: Condition, input: ScanInput, today: string): EligibilityResult {
  const facts = deriveFacts(input, today);
  const lines: ConditionResult[] = [];
  const overall = evaluate(rule, facts, lines);
  const pick = (t: Truth) => lines.filter((l) => l.result === t).map((l) => l.label);
  return {
    status: overall === "met" ? "eligible" : overall === "unknown" ? "maybe" : "not_eligible",
    met: pick("met"),
    unmet: pick("unmet"),
    unknown: pick("unknown"),
  };
}

/** Sort order for results: eligible first, then maybe, then not eligible. */
export const STATUS_RANK: Record<EligibilityStatus, number> = {
  eligible: 0,
  maybe: 1,
  not_eligible: 2,
};
