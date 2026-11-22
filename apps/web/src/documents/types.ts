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
  | { kind: "sheet"; builder: "capTable" | "financialModel"; sheets: { name: string; what: string }[] };

export const CATEGORIES = ["fundraising", "legal", "financial", "team"] as const;
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
export const fileName = (d: FounderDoc) => `foundura-${d.slug}.${EXT[d.template.kind]}`;
