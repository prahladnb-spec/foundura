import { describe, expect, it } from "vitest";
import { normalize, queryTokens, SearchIndex, type SearchEntry } from "./search";

const entries: SearchEntry<null>[] = [
  { kind: "scheme", id: "sisfs", title: ["Startup India Seed Fund Scheme", "स्टार्टअप इंडिया सीड फ़ंड योजना"], tags: ["DPIIT"], body: ["Grants and loans for proof of concept."], data: null },
  { kind: "template", id: "pitch-deck", title: ["Pitch deck", "पिच डेक"], body: ["The slides investors expect."], data: null },
  { kind: "term", id: "esop", title: ["ESOP", "ईसॉप"], body: ["Employee stock option plan: shares promised to the team."], data: null },
  { kind: "guide", id: "seed", title: ["How to raise a seed round"], body: ["Pitch deck, data room and the investors to approach."], data: null },
  { kind: "template", id: "cap-table", title: ["Cap table", "資本政策表"], data: null },
];
const index = new SearchIndex(entries);
const ids = (q: string) => index.search(q).map((h) => h.entry.id);

describe("search", () => {
  it("folds case, accents, nukta and chandrabindu", () => {
    expect(normalize("Café")).toBe("cafe");
    expect(normalize("फ़ंड")).toBe(normalize("फंड"));
    expect(normalize("योजनाएँ")).toBe(normalize("योजनाएं"));
  });

  it("drops filler words unless they are all there is", () => {
    expect(queryTokens("how to get a seed fund")).toEqual(["get", "seed", "fund"]);
    expect(queryTokens("how")).toEqual(["how"]);
  });

  it("needs every word to match", () => {
    expect(ids("seed fund")).toEqual(["sisfs"]);
    expect(ids("seed").sort()).toEqual(["seed", "sisfs"]);
    expect(ids("seed banana")).toEqual([]);
  });

  it("ranks a title match above a match in the text", () => {
    expect(ids("pitch deck")).toEqual(["pitch-deck", "seed"]);
  });

  it("matches the start of a word and Hindi text", () => {
    expect(ids("pitc")).toContain("pitch-deck");
    expect(ids("पिच")).toEqual(["pitch-deck"]);
    expect(ids("सीड फंड")).toEqual(["sisfs"]);
    expect(ids("esop")).toEqual(["esop"]);
  });

  it("finds Japanese words inside text written without spaces", () => {
    expect(ids("政策")).toEqual(["cap-table"]);
    expect(ids("資本政策表")).toEqual(["cap-table"]);
  });

  it("filters by kind and ignores an empty query", () => {
    expect(index.search("seed", { kinds: ["guide"] }).map((h) => h.entry.id)).toEqual(["seed"]);
    expect(index.search("  ")).toEqual([]);
  });
});
