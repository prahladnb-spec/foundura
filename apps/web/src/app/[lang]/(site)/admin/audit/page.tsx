import { editorApi } from "@/lib/editor-api";

interface Entry {
  id: string;
  actorId: string | null;
  actorLabel: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_LABEL: Record<string, string> = {
  "scheme.verify": "Marked scheme checked",
  "scheme.edit": "Edited scheme",
  "scheme.edit_verify": "Edited and checked scheme",
  "scheme.create": "Added scheme",
  "investor.verify": "Verified investor",
  "investor.unverify": "Removed investor verification",
  "investor.list": "Listed investor",
  "investor.unlist": "Hid investor from directory",
  "article.draft": "Saved article draft",
  "article.edit": "Edited article",
  "article.publish": "Published article",
  "import.events": "Imported events",
  "import.policy": "Imported policy items",
  "digest.send": "Sent weekly scheme alerts",
};

export const metadata = { title: "Audit log" };

export default async function AdminAudit() {
  const rows = await editorApi<Entry[]>("/admin/audit");
  if (!rows) return null;
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Audit log</h1>
      <p className="mt-3 max-w-[65ch] text-slate">Every change made through the admin console or the import key, newest first.</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate">No changes yet.</p>
      ) : (
        <ol className="mt-6 divide-y divide-rule border-y border-rule">
          {rows.map((r) => (
            <li key={r.id} className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr]">
              <time dateTime={r.createdAt} className="text-slate">
                {new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
              </time>
              <div>
                <span className="font-semibold">{ACTION_LABEL[r.action] ?? r.action}</span>{" "}
                <span className="text-neel-700">{r.targetId}</span>
                {typeof r.detail?.imported === "number" && <span className="text-slate"> ({r.detail.imported} rows)</span>}
                {typeof r.detail?.sent === "number" && <span className="text-slate"> ({r.detail.sent} sent)</span>}
                <span className="block text-[0.9rem] text-slate">
                  {r.actorLabel === "api-key" ? "Import key (scheduled task)" : r.actorId ? `Editor ${r.actorId.slice(0, 8)}` : "Deleted editor"}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
