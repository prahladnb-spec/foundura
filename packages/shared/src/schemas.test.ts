import { describe, expect, it } from "vitest";
import { patchSchema, startupProfileSchema } from "./schemas";

describe("patchSchema", () => {
  it("leaves out fields the request didn't send, even ones with defaults", () => {
    const r = patchSchema(startupProfileSchema).parse({ turnoverInrCr: 1.2 });
    expect(r).toEqual({ turnoverInrCr: 1.2 });
    expect(patchSchema(startupProfileSchema).parse({ isPublic: true })).toEqual({ isPublic: true });
  });
});
