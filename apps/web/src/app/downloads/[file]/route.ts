import { DOCS, fileName, type FounderDoc } from "@/documents";
import { buildDocx } from "@/documents/build/docx";
import { buildPptx } from "@/documents/build/pptx";
import { buildXlsx } from "@/documents/build/xlsx";
import { DECK_THEME_KEYS, type DeckTheme, type Template } from "@/documents/types";

// Template files are built once, at build time, from the content in src/documents.
export const dynamic = "force-static";
export const dynamicParams = false;

type Item = { name: string; doc: FounderDoc; template: Template; key?: "hi" | "example"; theme?: DeckTheme };
// Every document, its Hindi and example versions, and each deck in every colour combination.
const FILES: Item[] = DOCS.flatMap((doc) =>
  [{ template: doc.template, key: undefined }, ...(doc.variants ?? [])].flatMap(({ template, key }): Item[] =>
    template.kind === "deck"
      ? DECK_THEME_KEYS.map((theme) => ({ name: fileName(doc, key, theme), doc, template, key, theme }))
      : [{ name: fileName(doc, key), doc, template, key }],
  ),
);
export const generateStaticParams = () => FILES.map((x) => ({ file: x.name }));

const TYPES = {
  doc: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  deck: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  sheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const x = FILES.find((i) => i.name === file);
  if (!x) return new Response("Not found", { status: 404 });
  const kind = x.template.kind;
  const buf = kind === "doc" ? await buildDocx(x.doc, x.template, x.key) : kind === "deck" ? await buildPptx(x.doc, x.template, x.key, x.theme) : await buildXlsx(x.doc);
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": TYPES[kind], "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "public, max-age=3600" },
  });
}
