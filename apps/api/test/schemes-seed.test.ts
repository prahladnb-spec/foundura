import { checkEligibility, type Condition, type FactKey } from "@foundura/shared";
import { describe, expect, it } from "vitest";
import { SCHEMES } from "../db/seed-data/schemes";

const KNOWN_FACTS: FactKey[] = [
  "entityType",
  "incorporationDate",
  "turnoverInrCr",
  "dpiitRecognised",
  "state",
  "sectors",
  "stage",
  "isDeepTech",
  "womenLed",
  "govtSupportReceivedInrLakh",
  "indianPromoterSharePct",
  "ageYears",
];

function facts(c: Condition): string[] {
  if ("fact" in c) return [c.fact];
  return ("all" in c ? c.all : c.any).flatMap(facts);
}

const TODAY = "2026-11-22";

describe("scheme seed catalogue", () => {
  it("has unique slugs and an https source for every scheme", () => {
    const slugs = SCHEMES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of SCHEMES) expect(s.sourceUrl).toMatch(/^https:\/\//);
  });

  it("only uses facts the scan collects", () => {
    for (const s of SCHEMES) {
      for (const f of facts(s.rule)) expect(KNOWN_FACTS, `${s.slug} uses ${f}`).toContain(f);
    }
  });

  it("gives 'maybe' (never 'eligible') when nothing is answered", () => {
    for (const s of SCHEMES) expect(checkEligibility(s.rule, {}, TODAY).status, s.slug).toBe("maybe");
  });

  it("matches a typical young Karnataka medtech startup sensibly", () => {
    const input = {
      entityType: "private_limited" as const,
      incorporationDate: "2025-06-01",
      turnoverInrCr: 0.4,
      dpiitRecognised: true,
      state: "KA" as const,
      sectors: ["medtech" as const],
      stage: "prototype" as const,
      isDeepTech: true,
      womenLed: false,
      govtSupportReceivedInrLakh: 0,
      indianPromoterSharePct: 100,
    };
    const by = Object.fromEntries(SCHEMES.map((s) => [s.slug, checkEligibility(s.rule, input, TODAY).status]));
    expect(by["dpiit-startup-recognition"]).toBe("eligible");
    expect(by["birac-big"]).toBe("eligible");
    expect(by["karnataka-startup-policy-2025-30"]).toBe("eligible");
    expect(by["uttar-pradesh-startup-policy-2026"]).toBe("not_eligible");
    expect(by["stand-up-india"]).toBe("not_eligible");
    expect(by["credit-guarantee-scheme-startups"]).toBe("not_eligible");
  });
});
