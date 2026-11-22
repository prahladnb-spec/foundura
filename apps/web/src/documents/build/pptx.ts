import PptxGenJS from "pptxgenjs";
import type { FounderDoc } from "..";

/** Builds the PowerPoint file for a deck template: one slide per entry, with prompts to replace. */
export async function buildPptx(d: FounderDoc): Promise<Buffer> {
  if (d.template.kind !== "deck") throw new Error(`${d.slug} is not a deck template`);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.author = "Foundura";
  pptx.title = d.title;
  const slides = d.template.slides;
  slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F7F8FC" };
    slide.addShape("rect", { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: "F2A900" }, line: { color: "F2A900" } });
    slide.addText(s.title, { x: 0.8, y: 0.55, w: 11.7, h: 1.5, fontFace: "Calibri", fontSize: i === 0 ? 40 : 32, bold: true, color: "141B47", valign: "top" });
    slide.addText(
      s.prompts.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
      { x: 0.8, y: 2.3, w: 11.7, h: 3.9, fontFace: "Calibri", fontSize: 20, color: "5B6478", valign: "top", paraSpaceAfter: 12 },
    );
    slide.addText(`${i + 1} / ${slides.length}`, { x: 11.3, y: 6.85, w: 1.5, h: 0.4, fontFace: "Calibri", fontSize: 11, color: "5B6478", align: "right" });
    slide.addNotes(`Replace the grey prompts with your own content. ${i === 0 ? "Template from Foundura (foundura.org). " : ""}Keep one idea per slide.`);
  });
  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}
