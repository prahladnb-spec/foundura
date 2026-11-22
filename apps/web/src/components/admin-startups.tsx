"use client";

import { useEffect, useState } from "react";
import { adminCall, btnQuiet, shortDate } from "@/lib/admin-client";

interface Row {
  id: string;
  slug: string;
  name: string;
  oneLiner: string | null;
  website: string | null;
  productUrl: string | null;
  showcaseHiddenAt: string | null;
  updatedAt: string;
  email: string;
}

const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function AdminStartups() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminCall<Row[]>("startups").then(setRows, (e) => setErr(e.message));
  }, []);

  async function setHidden(id: string, hidden: boolean) {
    setErr(null);
    try {
      const r = await adminCall<Partial<Row>>(`startups/${id}/showcase`, "POST", { hidden });
      setRows((p) => p!.map((x) => (x.id === id ? { ...x, ...r } : x)));
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (!rows) return <p className="text-slate">{err ?? "Loading startups…"}</p>;
  if (!rows.length) return <p className="text-slate">No startups have a public profile yet.</p>;

  return (
    <>
      {err && <p role="alert" className="mb-4 text-marigold-ink">{err}</p>}
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
            <div className="min-w-[16rem] flex-1">
              <p className="font-semibold">
                {r.showcaseHiddenAt ? r.name : <a href={`/startups/${r.slug}`} target="_blank" rel="noreferrer">{r.name}</a>}
              </p>
              {r.oneLiner && <p className="text-[0.95rem]">{r.oneLiner}</p>}
              <p className="text-[0.95rem] text-slate">
                Updated {shortDate(r.updatedAt)}. {r.email}
              </p>
              <p className="flex flex-wrap gap-x-4 text-[0.95rem]">
                {r.website && <a href={r.website} target="_blank" rel="noreferrer nofollow">{host(r.website)}</a>}
                {r.productUrl && <a href={r.productUrl} target="_blank" rel="noreferrer nofollow">Product: {host(r.productUrl)}</a>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {r.showcaseHiddenAt ? (
                <span className="rounded bg-marigold-50 px-2 py-1 font-semibold text-marigold-ink">Hidden {shortDate(r.showcaseHiddenAt)}</span>
              ) : (
                <span className="rounded bg-leaf-50 px-2 py-1 font-semibold text-leaf">On the showcase</span>
              )}
              <button type="button" className={btnQuiet} onClick={() => setHidden(r.id, !r.showcaseHiddenAt)}>
                {r.showcaseHiddenAt ? "Show again" : "Hide from showcase"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
