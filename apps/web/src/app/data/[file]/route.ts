import { DATASET_IDS, type DatasetId, LICENCE, loadDataset, toCsv } from "@/data/datasets";

// Lists come from the API through the same hourly cache the pages use.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = file.match(/^([a-z]+)\.(csv|json)$/);
  if (!m || !(DATASET_IDS as readonly string[]).includes(m[1])) return new Response("Not found", { status: 404 });
  const id = m[1] as DatasetId;
  const { rows, asOf, checked } = await loadDataset(id);
  const headers = { "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" };
  if (m[2] === "csv") {
    return new Response(toCsv(rows), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="foundura-${id}.csv"` } });
  }
  const body = { dataset: id, source: "Foundura (foundura.org)", licence: LICENCE, asOf, checkedByEditor: checked, rows };
  return Response.json(body, { headers });
}
