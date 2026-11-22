import type { Metadata } from "next";
import Link from "next/link";
import { apiOr } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { ArticleSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Founder guides",
  description: "Practical guides for Indian founders on ideas, building, funding, growth and scaling. A new one every day.",
};

export default async function LearnPage() {
  const articles = await apiOr<ArticleSummary[]>("/articles", []);
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Founder guides</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">
        A new guide every day: ideas on Tuesday, building on Wednesday, funding on Thursday, growth on Friday, scaling on
        Saturday, and a weekly round-up on Sunday.
      </p>
      <ul className="mt-8 border-t-2 border-neel-900">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-rule py-6">
            <p className="text-[0.9rem] text-slate">{a.theme}, {fmtDate(a.publishedAt)}, {a.readMinutes} min read</p>
            <Link href={`/learn/${a.slug}`} className="mt-1 block text-2xl font-semibold leading-snug hover:underline">{a.title}</Link>
            <p className="mt-1 max-w-[68ch] text-neel-700">{a.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
