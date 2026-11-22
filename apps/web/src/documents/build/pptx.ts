import PptxGenJS from "pptxgenjs";
import type { FounderDoc } from "..";
import { DECK_THEMES, type DeckTheme, type Template } from "../types";

/** Builds the PowerPoint file for a deck template: one slide per entry, with prompts to replace. */
export async function buildPptx(d: FounderDoc, template: Template = d.template, key?: "hi" | "example", theme: DeckTheme = "classic"): Promise<Buffer> {
  const c = DECK_THEMES[theme];
  const face = key === "hi" ? "Nirmala UI" : "Calibri";
  if (template.kind !== "deck") throw new Error(`${d.slug} is not a deck template`);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.author = "Foundura";
  pptx.title = d.title;
  const slides = template.slides;
  slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: c.bg };
    slide.addShape("rect", { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: c.accent }, line: { color: c.accent } });
    // A short accent rule under the title area ties the colour through the slide.
    slide.addShape("rect", { x: 0.8, y: 2.14, w: 1.2, h: 0.06, fill: { color: c.accent }, line: { color: c.accent } });
    slide.addText(s.title, { x: 0.8, y: 0.55, w: 11.7, h: 1.5, fontFace: face, fontSize: i === 0 ? 40 : 32, bold: true, color: c.title, valign: "bottom" });
    slide.addText(
      s.prompts.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
      { x: 0.8, y: 2.45, w: 11.7, h: 3.9, fontFace: face, fontSize: 20, color: c.text, valign: "top", paraSpaceAfter: 12 },
    );
    slide.addText(`${i + 1} / ${slides.length}`, { x: 11.3, y: 6.85, w: 1.5, h: 0.4, fontFace: face, fontSize: 11, color: c.text, align: "right" });
    slide.addNotes(key === "example" ? "A filled-in example for a made-up startup. Every name and number is invented." : `Replace the grey prompts with your own content. ${i === 0 ? "Template from Foundura (foundura.org). " : ""}Keep one idea per slide.`);
  });
  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}
