import { describe, expect, it } from "vitest";
import { patchSchema, startupProfileSchema } from "./schemas";
import { charCount, seoChecks } from "./seo";

describe("patchSchema", () => {
  it("leaves out fields the request didn't send, even ones with defaults", () => {
    const r = patchSchema(startupProfileSchema).parse({ turnoverInrCr: 1.2 });
    expect(r).toEqual({ turnoverInrCr: 1.2 });
    expect(patchSchema(startupProfileSchema).parse({ isPublic: true })).toEqual({ isPublic: true });
  });
});

describe("seoChecks", () => {
  const good = {
    title: "How to get DPIIT recognition",
    slug: "dpiit-recognition-guide",
    excerpt: "What DPIIT recognition gives you and how to apply, step by step.",
    body: "## Why\n\nDPIIT recognition opens most central startup benefits.\n\nMore text.",
    focusKeyphrase: "DPIIT recognition",
    seoTitle: "DPIIT recognition: how to apply in 2026 | Foundura",
    metaDescription:
      "DPIIT recognition opens tax, IP and procurement benefits for Indian startups. Here is who qualifies under the 2026 rules and how to apply, step by step.",
    keywords: Array.from({ length: 15 }, (_, i) => `keyword ${i}`),
  };
  it("passes a well-prepared article", () => {
    expect(seoChecks(good).filter((c) => !c.ok)).toEqual([]);
  });
  it("flags what's missing", () => {
    const failed = seoChecks({ ...good, focusKeyphrase: "angel tax", metaDescription: "Too short.", keywords: ["a1", "a1"] })
      .filter((c) => !c.ok)
      .map((c) => c.id);
    expect(failed).toEqual(expect.arrayContaining(["focus-title", "focus-description", "focus-slug", "focus-intro", "description-length", "keywords"]));
  });
  it("counts Devanagari as people see it", () => {
    expect(charCount("स्टार्टअप")).toBeLessThan("स्टार्टअप".length + 1);
  });
});
