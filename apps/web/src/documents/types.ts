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
export const fileName = (d: FounderDoc, key?: "hi" | "example") => {
  const t = key ? d.variants?.find((v) => v.key === key)?.template : d.template;
  return `foundura-${d.slug}${key ? `-${key}` : ""}.${EXT[(t ?? d.template).kind]}`;
};
