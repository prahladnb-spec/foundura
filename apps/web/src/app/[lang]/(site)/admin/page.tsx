import Link from "next/link";
import { editorApi } from "@/lib/editor-api";

interface Overview {
  users: number;
  startups: number;
  publicStartups: number;
  investors: number;
  unverifiedInvestors: number;
  schemes: number;
  unverifiedSchemes: number;
  events: number;
  policyItems: number;
  articles: number;
  draftArticles: number;
  intros: Record<string, number>;
}

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const o = await editorApi<Overview>("/admin/overview");
  if (!o) return null;
  const todo = [
    o.unverifiedSchemes > 0 && {
      href: "/admin/schemes",
      text: `${o.unverifiedSchemes} of ${o.schemes} schemes haven't been checked against their official source`,
    },
    o.unverifiedInvestors > 0 && {
      href: "/admin/investors",
      text: `${o.unverifiedInvestors} investor ${o.unverifiedInvestors === 1 ? "profile is" : "profiles are"} waiting for review`,
    },
    o.draftArticles > 0 && {
      href: "/admin/articles",
      text: `${o.draftArticles} draft ${o.draftArticles === 1 ? "article" : "articles"} not yet published`,
    },
  ].filter(Boolean) as { href: string; text: string }[];

  const intros = (o.intros.pending ?? 0) + (o.intros.accepted ?? 0) + (o.intros.declined ?? 0) + (o.intros.withdrawn ?? 0);
  const stats = [
    { n: o.users, label: "accounts" },
    { n: o.startups, label: `startups, ${o.publicStartups} public` },
    { n: o.investors, label: "investor profiles" },
    { n: intros, label: `intro requests, ${o.intros.accepted ?? 0} accepted` },
    { n: o.events, label: "events listed" },
    { n: o.policyItems, label: "policy items" },
  ];

  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Needs attention</h1>
      {todo.length ? (
        <ul className="mt-5 space-y-2">
          {todo.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="flex items-center gap-3 rounded-md border border-marigold bg-marigold-50 px-4 py-3 font-semibold text-neel-950 no-underline hover:border-marigold-ink">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-marigold" />
                {t.text}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-md bg-leaf-50 px-4 py-3 text-leaf">Everything is reviewed. Nice work.</p>
      )}

      <h2 className="mt-12 text-[1.35rem] font-bold">Platform at a glance</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border-l-[3px] border-neel-100 pl-4">
            <dd className="display text-[2.4rem] leading-none text-neel-950">{s.n.toLocaleString("en-IN")}</dd>
            <dt className="mt-1 text-slate">{s.label}</dt>
          </div>
        ))}
      </dl>
    </>
  );
}
