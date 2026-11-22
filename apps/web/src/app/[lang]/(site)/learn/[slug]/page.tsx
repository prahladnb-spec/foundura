import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, ApiError } from "@/lib/api";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import type { Article } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function load(slug: string): Promise<Article> {
  try {
    return await api<Article>(`/articles/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

type Params = Promise<{ slug: string; lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = await load((await params).slug);
  return { title: a.title, description: a.excerpt, openGraph: { type: "article", ...(a.publishedAt ? { publishedTime: a.publishedAt } : {}) } };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const cond = lang === "en" ? undefined : "en";
  const a = await load(p.slug);
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
          author: { "@type": "Organization", name: "Foundura" },
          publisher: { "@type": "Organization", name: "Foundura" },
          mainEntityOfPage: `${SITE}/learn/${a.slug}`,
        }}
      />
      <p className="text-slate">
        <Link href="/learn" className="underline">{t.learn.title}</Link>, <span lang={cond}>{a.theme}</span>
      </p>
      <h1 lang={cond} className="display mt-2 text-5xl md:text-6xl">{a.title}</h1>
      <p className="mt-3 text-slate">{fmtDate(a.publishedAt, true, lang)}, {f(t.common.minRead, { n: a.readMinutes })}</p>
      {t.common.contentInEnglish && <p className="mt-3 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      <div lang={cond} className="prose-f mt-8 text-[1.05rem]">
        {/* Markdown is editor-written; raw HTML is not rendered. */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown>
      </div>
    </article>
  );
}
