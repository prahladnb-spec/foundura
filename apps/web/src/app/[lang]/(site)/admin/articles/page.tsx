import Link from "next/link";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/admin-client";
import { getToken } from "@/lib/session";

interface Row {
  slug: string;
  title: string;
  theme: string;
  publishedAt: string | null;
  updatedAt: string;
}

export const metadata = { title: "Articles" };

export default async function AdminArticles() {
  const rows = await api<Row[]>("/admin/articles", { token: await getToken() });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[2.6rem] leading-none">Articles</h1>
          <p className="mt-3 max-w-[65ch] text-slate">
            The daily draft task writes one article a day into the content calendar. Paste it in here, check the facts and links, then publish.
          </p>
        </div>
        <Link href="/admin/articles/new" className="rounded-md bg-neel-900 px-4 py-2.5 font-semibold text-paper no-underline hover:bg-neel-950">
          New article
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-rule border-y border-rule">
        {rows.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
            <div>
              <Link href={`/admin/articles/${r.slug}`} className="font-semibold">{r.title}</Link>
              <span className="text-slate"> in {r.theme}</span>
            </div>
            {r.publishedAt ? (
              <span className="text-leaf">Published {shortDate(r.publishedAt)}</span>
            ) : (
              <span className="rounded bg-marigold-50 px-2 py-0.5 font-semibold text-marigold-ink">Draft</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
