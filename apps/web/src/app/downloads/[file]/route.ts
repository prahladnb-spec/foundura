import { DOCS, fileName } from "@/documents";
import { buildDocx } from "@/documents/build/docx";
import { buildPptx } from "@/documents/build/pptx";
import { buildXlsx } from "@/documents/build/xlsx";

// Template files are built once, at build time, from the content in src/documents.
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => DOCS.map((d) => ({ file: fileName(d) }));

const TYPES = {
  doc: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  deck: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  sheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const d = DOCS.find((x) => fileName(x) === file);
  if (!d) return new Response("Not found", { status: 404 });
  const kind = d.template.kind;
  const buf = kind === "doc" ? await buildDocx(d) : kind === "deck" ? await buildPptx(d) : await buildXlsx(d);
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": TYPES[kind], "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "public, max-age=3600" },
  });
}
