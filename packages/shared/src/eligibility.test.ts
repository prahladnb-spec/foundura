import { describe, expect, it } from "vitest";
import { checkEligibility, exactYearsSince, type Condition } from "./eligibility";

const TODAY = "2026-11-22";

const dpiitLike: Condition = {
  all: [
    {
      fact: "entityType",
      op: "in",
      value: ["private_limited", "llp", "partnership", "cooperative"],
      label: "Registered as a company, LLP, partnership or cooperative",
    },
    {
      any: [
        { fact: "ageYears", op: "lte", value: 10, label: "10 years old or less" },
        {
          all: [
            { fact: "isDeepTech", op: "isTrue", label: "Deep tech startup" },
            { fact: "ageYears", op: "lte", value: 20, label: "20 years old or less" },
          ],
        },
      ],
      label: "Within the age limit (10 years, or 20 for deep tech)",
    },
    { fact: "turnoverInrCr", op: "lte", value: 200, label: "Turnover up to ₹200 crore" },
  ],
};

describe("exactYearsSince", () => {
  it("counts fractional years", () => {
    expect(exactYearsSince("2016-11-22", TODAY)).toBeCloseTo(10, 1);
    expect(exactYearsSince("2016-09-22", TODAY)).toBeGreaterThan(10);
  });
});

describe("checkEligibility", () => {
  it("is eligible when every condition is met", () => {
    const r = checkEligibility(
      dpiitLike,
      { entityType: "private_limited", incorporationDate: "2023-04-01", turnoverInrCr: 2 },
      TODAY,
    );
    expect(r.status).toBe("eligible");
    expect(r.unmet).toEqual([]);
    expect(r.met).toContain("Turnover up to ₹200 crore");
  });

  it("is not eligible when one condition fails, and says which", () => {
    const r = checkEligibility(
      dpiitLike,
      { entityType: "sole_proprietorship", incorporationDate: "2023-04-01", turnoverInrCr: 2 },
      TODAY,
    );
    expect(r.status).toBe("not_eligible");
    expect(r.unmet).toEqual(["Registered as a company, LLP, partnership or cooperative"]);
  });

  it("is 'maybe' when an answer is missing, and never guesses", () => {
    const r = checkEligibility(dpiitLike, { entityType: "llp", turnoverInrCr: 5 }, TODAY);
    expect(r.status).toBe("maybe");
    expect(r.unknown).toEqual(["Within the age limit (10 years, or 20 for deep tech)"]);
  });

  it("applies the deep-tech age extension", () => {
    const old = { entityType: "private_limited" as const, incorporationDate: "2012-01-01", turnoverInrCr: 50 };
    // Deep-tech status unknown: it might still qualify, so "maybe", not a guess.
    expect(checkEligibility(dpiitLike, old, TODAY).status).toBe("maybe");
    expect(checkEligibility(dpiitLike, { ...old, isDeepTech: false }, TODAY).status).toBe("not_eligible");
    expect(checkEligibility(dpiitLike, { ...old, isDeepTech: true }, TODAY).status).toBe("eligible");
  });

  it("an unmet condition outweighs an unknown one", () => {
    const r = checkEligibility(dpiitLike, { entityType: "not_registered" }, TODAY);
    expect(r.status).toBe("not_eligible");
  });

  it("matches sectors with includesAny", () => {
    const rule: Condition = {
      fact: "sectors",
      op: "includesAny",
      value: ["medtech", "biotech"],
      label: "Works in biotech or medtech",
    };
    expect(checkEligibility(rule, { sectors: ["ai_software", "medtech"] }, TODAY).status).toBe("eligible");
    expect(checkEligibility(rule, { sectors: ["fintech"] }, TODAY).status).toBe("not_eligible");
    expect(checkEligibility(rule, { sectors: [] }, TODAY).status).toBe("maybe");
  });
});
