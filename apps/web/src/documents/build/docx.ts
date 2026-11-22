import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { CHECKED_ON, checkWith, type FounderDoc, reviewsFor } from "..";
import type { Block, Template } from "../types";

const INK = "141B47";
const GREY = "5B6478";
// Latin text in Calibri; Devanagari falls to the complex-script font.
const FONT = { ascii: "Calibri", hAnsi: "Calibri", cs: "Nirmala UI", eastAsia: "Calibri" };
const run = (text: string, o: Partial<{ bold: boolean; italics: boolean; color: string; size: number }> = {}) => new TextRun({ text, font: FONT, size: 22, ...o });
const para = (text: string, spacing = 140) => new Paragraph({ children: [run(text)], spacing: { after: spacing, line: 300 } });
const edge = { style: BorderStyle.SINGLE, size: 4, color: "C9CEDD" };

function table(head: string[], rows: string[][]): Table {
  const cols = head.length;
  const cell = (text: string, header: boolean) =>
    new TableCell({
      width: { size: Math.floor(100 / cols), type: WidthType.PERCENTAGE },
      margins: { top: 70, bottom: 70, left: 100, right: 100 },
      shading: header ? { fill: "EEF0F8" } : undefined,
      children: [new Paragraph({ children: [run(text, { bold: header, size: 20 })] })],
    });
  const hasHead = head.some((x) => x !== "");
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: edge, bottom: edge, left: edge, right: edge, insideHorizontal: edge, insideVertical: edge },
    rows: [
      ...(hasHead ? [new TableRow({ tableHeader: true, children: head.map((x) => cell(x, true)) })] : []),
      ...rows.map((r) => new TableRow({ children: Array.from({ length: cols }, (_, i) => cell(r[i] ?? "", !hasHead && i === 0)) })),
    ],
  });
}

function render(b: Block): (Paragraph | Table)[] {
  if ("h" in b) return [new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [run(b.h, { bold: true, color: INK, size: 26 })] })];
  if ("p" in b) return [para(b.p)];
  if ("note" in b) return [new Paragraph({ spacing: { after: 140 }, shading: { fill: "FFF6DD" }, children: [run(b.note, { italics: true, color: "6B4E00", size: 20 })] })];
  if ("ul" in b) return b.ul.map((t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80, line: 300 }, children: [run(t)] }));
  if ("ol" in b) return b.ol.map((t, i) => new Paragraph({ indent: { left: 500, hanging: 360 }, spacing: { after: 80, line: 300 }, children: [run(`${i + 1}.  ${t}`)] }));
  if ("table" in b) return [table(b.table.head, b.table.rows), new Paragraph({ spacing: { after: 140 }, children: [] })];
  return b.sign.flatMap((who) => [
    new Paragraph({ spacing: { before: 500 }, children: [run("______________________________")] }),
    para(who, 60),
    para("Name:                                        Date:", 60),
  ]);
}

/** The disclaimer at the top of a file: who should check it, and any professional review that has been done. */
export function verifyNotice(d: FounderDoc): string {
  const c = checkWith(d);
  if (!c.lawyer && !c.ca) return "A starting point. Adapt it to your business.";
  const who = c.lawyer && c.ca ? "chartered accountant and legal counsel" : c.lawyer ? "legal counsel" : "chartered accountant";
  const reviewed = reviewsFor(d).map((r) => `Reviewed by ${r.by} (${r.qualification}) on ${r.on}.`).join(" ");
  return `${reviewed ? `${reviewed} Even so, verify` : "Verify"} this independently with your own ${who} before you sign, file or rely on it. Laws, forms, rates and due dates change. Foundura is not a law firm or a firm of chartered accountants, and this is not legal, tax or financial advice.`;
}

/** Builds the Word file for a document template. */
export async function buildDocx(d: FounderDoc, template: Template = d.template, key?: "hi" | "example"): Promise<Buffer> {
  if (template.kind !== "doc") throw new Error(`${d.slug} is not a Word template`);
  const hi = key === "hi";
  const notice = hi
    ? "यह एक शुरुआत है। इसे अपने कारोबार के हिसाब से बदलें। [कोष्ठक] में लिखी हर चीज़ बदलें और इस बॉक्स और टिप्पणियों को हटा दें।"
    : key === "example"
      ? "A filled-in example for a made-up startup, to show the level of detail. Every name and number in it is invented."
      : `${verifyNotice(d)} Replace everything in [square brackets] and delete this box and the notes before you use it.`;
  const heading = hi ? d.titleHi : key === "example" ? `${d.title}: example` : d.title;
  const doc = new Document({
    creator: "Foundura",
    title: heading,
    description: d.summary,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [run(`Template from Foundura (foundura.org), last updated ${CHECKED_ON}. Page `, { color: GREY, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: GREY, size: 16, font: FONT })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 100 }, children: [run(heading, { bold: true, color: INK, size: 40 })] }),
          new Paragraph({
            spacing: { after: 300 },
            shading: { fill: "FFF6DD" },
            children: [run(notice, { italics: true, color: "6B4E00", size: 20 })],
          }),
          ...template.blocks.flatMap(render),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}
