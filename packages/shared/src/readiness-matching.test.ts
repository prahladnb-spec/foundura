import { INVESTOR_DOCS } from "./constants";
import { describe, expect, it } from "vitest";
import { matchScore } from "./matching";
import { readiness } from "./readiness";
import { investorProfileSchema } from "./schemas";

describe("readiness", () => {
  it("is 0 for an empty profile and every item has a fix", () => {
    const r = readiness({});
    expect(r.score).toBe(0);
    expect(r.band).toBe("getting_started");
    expect(r.items.every((i) => i.fix)).toBe(true);
  });

  it("gives part credit for some investor documents, and ignores duplicates", () => {
    const item = (docs: string[]) => readiness({ investorDocs: docs }).items.find((i) => i.key === "documents")!;
    expect(item([]).earned).toBe(0);
    expect(item(["pitch-deck", "cap-table", "pitch-deck"]).earned).toBe(3);
    expect(item([...INVESTOR_DOCS]).fix).toBeNull();
  });

  it("totals exactly 100 when everything is done", () => {
    const r = readiness({
      entityType: "private_limited",
      dpiitRecognised: true,
      oneLiner: "Affordable hearing screening for rural clinics",
      description: "x".repeat(150),
      website: "https://example.com",
      deckUrl: "https://example.com/deck",
      sectors: ["medtech"],
      stage: "early_revenue",
      incorporationDate: "2024-01-01",
      state: "KA",
      raisingInrLakh: 200,
      isPublic: true,
      investorVisibility: true,
      investorDocs: [...INVESTOR_DOCS],
    });
    expect(r.score).toBe(100);
    expect(r.band).toBe("investor_ready");
    expect(r.items.every((i) => i.fix === null)).toBe(true);
    expect(r.items.reduce((s, i) => s + i.points, 0)).toBe(100);
  });

  it("gives partial traction credit for a prototype and says what's next", () => {
    const t = readiness({ stage: "prototype" }).items.find((i) => i.key === "traction")!;
    expect(t.earned).toBe(8);
    expect(t.fix).toMatch(/revenue/);
  });
});

describe("matchScore", () => {
  const inv = { sectors: ["medtech", "healthtech"], stages: ["prototype", "early_revenue"], states: [], chequeMinInrLakh: 25, chequeMaxInrLakh: 100 };

  it("scores a full match at 100 with reasons", () => {
    const m = matchScore({ sectors: ["medtech"], stage: "prototype", state: "KA", raisingInrLakh: 150 }, inv);
    expect(m.score).toBe(100);
    expect(m.gaps).toEqual([]);
    expect(m.reasons).toContain("Invests across India");
  });

  it("explains gaps", () => {
    const m = matchScore({ sectors: ["fintech"], stage: "growth", state: "KA", raisingInrLakh: 5 }, { ...inv, states: ["MH"] });
    expect(m.score).toBe(0);
    expect(m.gaps).toHaveLength(4);
  });

  it("does not penalise a missing ask beyond the cheque points", () => {
    const m = matchScore({ sectors: ["medtech"], stage: "prototype", state: "KA" }, inv);
    expect(m.score).toBe(85);
  });
});

describe("investorProfileSchema", () => {
  it("rejects a max cheque below the min", () => {
    const r = investorProfileSchema.safeParse({
      name: "Test", type: "angel", sectors: ["medtech"], stages: ["idea"], chequeMinInrLakh: 50, chequeMaxInrLakh: 10,
    });
    expect(r.success).toBe(false);
  });
});
