import Link from "next/link";
import { api } from "@/lib/api";
import { stateLabel } from "@/lib/labels";
import { getToken } from "@/lib/session";
import { shortDate } from "@/lib/admin-client";

interface Row {
  slug: string;
  name: string;
  level: string;
  state: string | null;
  status: string;
  lastVerifiedAt: string | null;
  updatedAt: string;
  hiStatus: "missing" | "current" | "outdated";
}

const HI = {
  current: { text: "Up to date", cls: "text-leaf" },
  outdated: { text: "Out of date", cls: "rounded bg-marigold-50 px-2 py-0.5 font-semibold text-marigold-ink" },
  missing: { text: "None", cls: "text-slate" },
};

export const metadata = { title: "Schemes" };

export default async function AdminSchemes() {
  const rows = await api<Row[]>("/admin/schemes", { token: await getToken() });
  const pending = rows.filter((r) => !r.lastVerifiedAt).length;
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Schemes</h1>
      <p className="mt-3 max-w-[65ch] text-slate">
        Founders see “confirm on the official source” on any scheme that hasn&apos;t been checked. Open a scheme, compare it with the
        official page, and mark it checked. {pending ? `${pending} still to check.` : "All checked."}
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b-2 border-neel-900 text-[0.95rem]">
            <tr>
              <th className="py-2 pr-4 font-semibold">Scheme</th>
              <th className="py-2 pr-4 font-semibold">Where</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Last checked</th>
              <th className="py-2 font-semibold">Hindi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-rule">
                <td className="py-3 pr-4">
                  <Link href={`/admin/schemes/${r.slug}`} className="font-semibold">
                    {r.name}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-slate">{r.level === "state" ? stateLabel(r.state) : "All India"}</td>
                <td className="py-3 pr-4 text-slate capitalize">{r.status}</td>
                <td className="py-3 pr-4">
                  {r.lastVerifiedAt ? (
                    <span className="text-leaf">{shortDate(r.lastVerifiedAt)}</span>
                  ) : (
                    <span className="rounded bg-marigold-50 px-2 py-0.5 font-semibold text-marigold-ink">Not checked</span>
                  )}
                </td>
                <td className="py-3">
                  <span className={HI[r.hiStatus].cls}>{HI[r.hiStatus].text}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
