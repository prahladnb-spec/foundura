/**
 * The founder document kit. Each document has a short guide and a template that is turned into a
 * real Word, Excel or PowerPoint file by /downloads/[file]. Guides and templates are in English;
 * titles and summaries are also in Hindi.
 */
export type Block =
  | { h: string }
  | { p: string }
  /** Drafting guidance, shown in italics. The user deletes it before using the document. */
  | { note: string }
  | { ul: string[] }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][] } }
  /** Signature blocks, one per party. */
  | { sign: string[] };

export type Template =
  | { kind: "doc"; blocks: Block[] }
  | { kind: "deck"; slides: { title: string; prompts: string[] }[] }
  | { kind: "sheet"; builder: "capTable" | "financialModel" | "grid"; sheets: { name: string; what: string; grid?: Grid }[] };

/** A cell in a simple spreadsheet: text, a number, or a formula (A1 references; the header is row 1). */
export type Cell = string | number | { f: string };
export interface Grid {
  columns: { head: string; width?: number; fmt?: "inr" | "pct" | "int" }[];
  rows: Cell[][];
}
export const fx = (f: string): Cell => ({ f });

export const CATEGORIES = ["planning", "fundraising", "legal", "financial", "team", "sector"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface FounderDoc {
  slug: string;
  category: Category;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  /** When a founder needs it. */
  when: string;
  include: string[];
  /** Points specific to India. */
  india: string[];
  mistakes: string[];
  /** A legal instrument: the page and the file say to have a lawyer review it before signing. */
  lawyer: boolean;
  template: Template;
  /** Extra downloads: the same template in Hindi, or a filled-in example. */
  variants?: { key: "hi" | "example"; template: Template }[];
}

export const h = (s: string): Block => ({ h: s });
export const p = (s: string): Block => ({ p: s });
export const note = (s: string): Block => ({ note: s });
export const ul = (...items: string[]): Block => ({ ul: items });
export const ol = (...items: string[]): Block => ({ ol: items });
export const table = (head: string[], ...rows: string[][]): Block => ({ table: { head, rows } });
export const sign = (...parties: string[]): Block => ({ sign: parties });

/** Clauses most agreements end with. */
export const closing = (seat = "[City]"): Block[] => [
  h("Governing law and disputes"),
  p(`This agreement is governed by the laws of India. The parties will first try to settle any dispute by discussion within 30 days. If that fails, the dispute will be referred to arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996. The seat of arbitration is ${seat} and the language is English. Subject to this, the courts at ${seat} have exclusive jurisdiction.`),
  h("General"),
  ul(
    "This agreement is the whole agreement between the parties on its subject and replaces earlier discussions.",
    "Changes must be in writing and signed by all parties.",
    "If a clause is found unenforceable, the rest of the agreement continues.",
    "Notices must be in writing and sent to the addresses above, or by email to the addresses the parties have given each other.",
    "No party may assign this agreement without the others' written consent.",
  ),
];

export const EXT = { doc: "docx", deck: "pptx", sheet: "xlsx" } as const;
/** Colour combinations for PowerPoint decks. Hex without "#". The first is the default and has no file suffix. */
export const DECK_THEMES = {
  classic: { bg: "F7F8FC", title: "141B47", text: "5B6478", accent: "F2A900" },
  ocean: { bg: "F2F8FA", title: "0B3C5D", text: "4F6475", accent: "14919B" },
  forest: { bg: "F4F8F2", title: "1E4D3A", text: "54655B", accent: "C98A1B" },
  plum: { bg: "FAF5F8", title: "4A1942", text: "6A5868", accent: "D6457A" },
  slate: { bg: "F5F5F3", title: "23272F", text: "5E636E", accent: "E4572E" },
  midnight: { bg: "10172F", title: "FFFFFF", text: "C3CAE0", accent: "F2A900" },
} as const;
export type DeckTheme = keyof typeof DECK_THEMES;
export const DECK_THEME_KEYS = Object.keys(DECK_THEMES) as DeckTheme[];

/** File name of a deck download: foundura-<slug>[-hi|-example][-<theme>].pptx */
export const deckFile = (slug: string, key?: "hi" | "example", theme: DeckTheme = "classic") =>
  `foundura-${slug}${key ? `-${key}` : ""}${theme === "classic" ? "" : `-${theme}`}.pptx`;

export const fileName = (d: FounderDoc, key?: "hi" | "example", theme?: DeckTheme) => {
  const t = (key ? d.variants?.find((v) => v.key === key)?.template : d.template) ?? d.template;
  return t.kind === "deck" ? deckFile(d.slug, key, theme) : `foundura-${d.slug}${key ? `-${key}` : ""}.${EXT[t.kind]}`;
};
