import { checkEligibility, type Condition, conditionSchema, FACT_KEYS, type FactKey, schemeEditSchema, schemeTranslationSchema, visibleConditionLabels } from "@foundura/shared";
import { describe, expect, it } from "vitest";
import { SCHEMES } from "../db/seed-data/schemes";
import { SCHEMES_HI } from "../db/seed-data/schemes-hi";

const KNOWN_FACTS: readonly FactKey[] = FACT_KEYS;

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

  it("passes the admin editor's validation, so every seeded scheme can be re-saved", () => {
    for (const s of SCHEMES) {
      const rule = conditionSchema.safeParse(s.rule);
      expect(rule.success, `${s.slug}: ${JSON.stringify(rule.error?.issues)}`).toBe(true);
      const all = schemeEditSchema.safeParse({ ...s, statusNote: s.statusNote ?? null });
      expect(all.success, `${s.slug}: ${JSON.stringify(all.error?.issues)}`).toBe(true);
    }
  });

  it("has a Hindi draft for every scheme that translates every visible condition", () => {
    expect(Object.keys(SCHEMES_HI).sort()).toEqual(SCHEMES.map((s) => s.slug).sort());
    for (const s of SCHEMES) {
      const hi = SCHEMES_HI[s.slug];
      expect(schemeTranslationSchema.safeParse(hi).success, s.slug).toBe(true);
      expect(Object.keys(hi.labels).sort(), `${s.slug} labels`).toEqual(visibleConditionLabels(s.rule).sort());
      expect(hi.benefits.length, `${s.slug} benefits`).toBe(s.benefits.length);
      expect(hi.howToApply.length, `${s.slug} howToApply`).toBe(s.howToApply.length);
      expect(hi.alsoCheck.length, `${s.slug} alsoCheck`).toBe(s.alsoCheck.length);
      expect(hi.statusNote === null, `${s.slug} statusNote`).toBe(!s.statusNote);
      expect(/[\u0900-\u097F]/.test(hi.summary), `${s.slug} summary in Devanagari`).toBe(true);
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
