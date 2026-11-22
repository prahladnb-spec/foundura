import { articleSchema, seoChecks } from "@foundura/shared";
import { describe, expect, it } from "vitest";
import { ARTICLES } from "../db/seed-data/articles";

describe("seeded guides", () => {
  it.each(ARTICLES.map((a) => [a.slug, a] as const))("%s passes validation and every search check", (_slug, a) => {
    expect(() => articleSchema.parse(a)).not.toThrow();
    expect(seoChecks(a).filter((c) => !c.ok).map((c) => c.label)).toEqual([]);
  });
});
