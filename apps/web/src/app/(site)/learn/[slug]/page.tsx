import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, ApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { Article } from "@/lib/types";

async function load(slug: string): Promise<Article> {
  try {
    return await api<Article>(`/articles/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await load((await params).slug);
  return { title: a.title, description: a.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await load((await params).slug);
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <p className="text-slate">
        <Link href="/learn" className="underline">Founder guides</Link>, {a.theme}
      </p>
      <h1 className="display mt-2 text-5xl md:text-6xl">{a.title}</h1>
      <p className="mt-3 text-slate">{fmtDate(a.publishedAt)}, {a.readMinutes} min read</p>
      <div className="prose-f mt-8 text-[1.05rem]">
        {/* Markdown is editor-written; raw HTML is not rendered. */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown>
      </div>
    </article>
  );
}
