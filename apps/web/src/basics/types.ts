/** A block of chapter text: a paragraph, a list, a table or a highlighted tip. */
export type Block =
  | { t: "p"; x: string }
  | { t: "ul"; x: string[] }
  | { t: "ol"; x: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "tip"; x: string };

export type Section = { h: string; blocks: Block[] };

/** One chapter in one language. */
export type ChapterText = {
  title: string;
  /** One or two sentences, about 110–140 characters: the chapter's promise, also its search description. */
  summary: string;
  /** Searches this chapter should answer, most specific first. */
  keywords: string[];
  sections: Section[];
};

export type Chapter = {
  slug: string;
  /** Glossary terms (exact `term` from glossary.ts) explained further there. */
  terms: string[];
  /** Template slugs that help with this chapter. */
  docs: string[];
  /** Pages on Foundura to go to next. */
  links: ("funding" | "schemes" | "scan" | "investors")[];
  /** Show the dilution calculator after the text. */
  calculator?: boolean;
  en: ChapterText;
  hi: ChapterText;
};
