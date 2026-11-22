"use client";

import { useEffect, useState } from "react";
import { adminCall, btnQuiet, shortDate } from "@/lib/admin-client";
import { investorTypeLabel } from "@/lib/labels";

interface Row {
  id: string;
  slug: string;
  name: string;
  firm: string | null;
  type: string;
  website: string | null;
  isListed: boolean;
  verifiedAt: string | null;
  createdAt: string;
  email: string;
}

export function AdminInvestors() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminCall<Row[]>("investors").then(setRows, (e) => setErr(e.message));
  }, []);

  async function update(id: string, path: "verify" | "listing", body: object) {
    setErr(null);
    try {
      const r = await adminCall<Partial<Row>>(`investors/${id}/${path}`, "POST", body);
      setRows((p) => p!.map((x) => (x.id === id ? { ...x, ...r } : x)));
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (!rows) return <p className="text-slate">{err ?? "Loading investors…"}</p>;
  if (!rows.length) return <p className="text-slate">No investor profiles yet.</p>;

  return (
    <>
      {err && <p role="alert" className="mb-4 text-marigold-ink">{err}</p>}
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
            <div className="min-w-[16rem] flex-1">
              <p className="font-semibold">
                {r.name}
                {r.firm && <span className="font-normal text-slate">, {r.firm}</span>}
              </p>
              <p className="text-[0.95rem] text-slate">
                {investorTypeLabel(r.type)}. Joined {shortDate(r.createdAt)}. {r.email}
              </p>
              {r.website && (
                <a href={r.website} target="_blank" rel="noreferrer" className="text-[0.95rem]">
                  {r.website.replace(/^https:\/\//, "")}
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {r.verifiedAt ? (
                <span className="rounded bg-leaf-50 px-2 py-1 font-semibold text-leaf">Verified {shortDate(r.verifiedAt)}</span>
              ) : (
                <span className="rounded bg-marigold-50 px-2 py-1 font-semibold text-marigold-ink">Waiting for review</span>
              )}
              {!r.isListed && <span className="rounded bg-slate-50 px-2 py-1 font-semibold text-slate">Hidden</span>}
              <button type="button" className={btnQuiet} onClick={() => update(r.id, "verify", { verified: !r.verifiedAt })}>
                {r.verifiedAt ? "Remove verification" : "Verify"}
              </button>
              <button type="button" className={btnQuiet} onClick={() => update(r.id, "listing", { isListed: !r.isListed })}>
                {r.isListed ? "Hide from directory" : "Show in directory"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
