import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { apiOr } from "@/lib/api";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import type { ArticleSummary } from "@/lib/types";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getDict(await langOf(params));
  return { title: t.learn.title, description: t.learn.metaDescription };
}

export default async function LearnPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const cond = lang === "en" ? undefined : "en";
  const articles = await apiOr<ArticleSummary[]>("/articles", []);
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{t.learn.title}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-neel-700">{t.learn.lead}</p>
      {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      <ul className="mt-8 border-t-2 border-neel-900">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-rule py-6">
            <p className="text-[0.9rem] text-slate"><span lang={cond}>{a.theme}</span>, {fmtDate(a.publishedAt, true, lang)}, {f(t.common.minRead, { n: a.readMinutes })}</p>
            <Link href={`/learn/${a.slug}`} lang={cond} className="mt-1 block text-2xl font-semibold leading-snug hover:underline">{a.title}</Link>
            <p lang={cond} className="mt-1 max-w-[68ch] text-neel-700">{a.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
