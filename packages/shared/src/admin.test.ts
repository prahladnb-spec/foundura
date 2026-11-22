import { describe, expect, it } from "vitest";
import { conditionSchema, readMinutes } from "./admin";

describe("conditionSchema", () => {
  it("accepts a nested rule", () => {
    const r = conditionSchema.safeParse({
      all: [
        { fact: "dpiitRecognised", op: "isTrue", label: "DPIIT recognised" },
        { any: [{ fact: "ageYears", op: "lte", value: 10, label: "Up to 10 years" }], label: "Age" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown facts, wrong value types and stray keys", () => {
    expect(conditionSchema.safeParse({ fact: "caste", op: "eq", value: "x", label: "Nope" }).success).toBe(false);
    expect(conditionSchema.safeParse({ fact: "ageYears", op: "lte", value: "ten", label: "Age" }).success).toBe(false);
    expect(conditionSchema.safeParse({ fact: "state", op: "in", value: "KA", label: "State" }).success).toBe(false);
    expect(conditionSchema.safeParse({ fact: "womenLed", op: "isTrue", value: true, label: "Woman-led" }).success).toBe(false);
    expect(conditionSchema.safeParse({ all: [], label: "Empty" }).success).toBe(false);
    expect(conditionSchema.safeParse({ fact: "state", op: "eq", value: "KA", label: "State", extra: 1 }).success).toBe(false);
  });
});

describe("conditionSchema errors", () => {
  it("points at the exact field", () => {
    const r = conditionSchema.safeParse({ all: [{ fact: "ageYears", op: "lte", value: 10, label: "Age" }, { fact: "religion", op: "eq", value: "x", label: "Nope" }] });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path).toEqual(["all", 1, "fact"]);
    expect(r.error!.issues[0].message).toMatch(/religion/);
  });
});

describe("readMinutes", () => {
  it("estimates reading time", () => {
    expect(readMinutes("word ".repeat(1000))).toBe(5);
    expect(readMinutes("short")).toBe(1);
  });
});

describe("visibleConditionLabels", () => {
  it("lists fact labels and labelled groups, not the children of labelled groups", async () => {
    const { visibleConditionLabels } = await import("./admin");
    expect(
      visibleConditionLabels({
        all: [
          { fact: "dpiitRecognised", op: "isTrue", label: "A" },
          { any: [{ fact: "ageYears", op: "lte", value: 10, label: "hidden" }], label: "B" },
          { all: [{ fact: "womenLed", op: "isTrue", label: "C" }, { fact: "dpiitRecognised", op: "isTrue", label: "A" }] },
        ],
      }),
    ).toEqual(["A", "B", "C"]);
  });
});
