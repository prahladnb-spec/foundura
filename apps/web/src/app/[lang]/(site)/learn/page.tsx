import { pageMetadata } from "@/seo";
import { StartupJourney } from "@/components/infographics/startup-journey";
import { PageIntro } from "@/components/art";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { GUIDE_TOPICS } from "@foundura/shared";
import { apiOr } from "@/lib/api";
import { f, getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import type { ArticleSummary } from "@/lib/types";
import { START_HERE } from "@/guides";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("learn", isLang(lang) ? lang : "en");
}

type Popular = { slug: string; title: string; readMinutes: number; views: number };

export default async function LearnPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const l = t.learn;
  const cond = lang === "en" ? undefined : "en";
  const [articles, popular] = await Promise.all([
    apiOr<ArticleSummary[]>("/articles", []),
    // From anonymous daily page-view totals; refreshed hourly.
    apiOr<Popular[]>("/articles/popular", [], 3600),
  ]);
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const start = START_HERE.map((s) => bySlug.get(s)).filter((a): a is ArticleSummary => !!a);
  const topics = GUIDE_TOPICS.filter((x) => articles.some((a) => a.topic === x));
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  const [wA, wB] = l.write.split("{link}");

  const meta = (a: ArticleSummary) => (
    <p className="text-[0.9rem] text-slate">
      {fmtDate(a.publishedAt, true, lang)}, {f(t.common.minRead, { n: a.readMinutes })}
      {a.authorName && <>, <span lang={cond}>{f(l.byAuthor, { name: a.authorName })}</span></>}
    </p>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <PageIntro art="learn">
        <h1 className="display text-6xl md:text-7xl">{l.title}</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-neel-700">{l.lead}</p>
        {t.common.contentInEnglish && <p className="mt-2 text-[0.92rem] text-slate">{t.common.contentInEnglish}</p>}
      </PageIntro>

      {start.length > 0 && (
        <section aria-labelledby="start-h" className="mt-10">
          <h2 id="start-h" className="display text-4xl">{l.startHere}</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {start.map((a, i) => (
              <li key={a.slug} className="flex gap-3 rounded-xl border-2 border-neel-900 bg-white p-5">
                <span aria-hidden="true" className="font-display text-3xl font-extrabold leading-none text-marigold-ink">{i + 1}</span>
                <span>
                  <Link href={`/learn/${a.slug}`} lang={cond} className="block text-lg font-semibold leading-snug hover:underline">{a.title}</Link>
                  <span className="mt-1 block text-[0.9rem] text-slate">{f(t.common.minRead, { n: a.readMinutes })}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <StartupJourney t={t} lang={lang} />

      {popular.length > 0 && (
        <section aria-labelledby="popular-h" className="mt-12">
          <h2 id="popular-h" className="display text-4xl">{l.mostRead}</h2>
          <ol className="mt-4 max-w-4xl list-decimal space-y-2 ps-6 marker:font-semibold marker:text-marigold-ink">
            {popular.map((a) => (
              <li key={a.slug}>
                <Link href={`/learn/${a.slug}`} lang={cond} className="text-lg font-semibold hover:underline">{a.title}</Link>
                <span className="text-[0.9rem] text-slate">, {f(t.common.minRead, { n: a.readMinutes })}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="topics-h" className="mt-12">
        <h2 id="topics-h" className="display text-4xl">{l.byTopic}</h2>
        <nav aria-labelledby="topics-h" className="mt-4 flex flex-wrap gap-2">
          {topics.map((x) => (
            <a key={x} href={`#topic-${x}`} className="rounded-full border border-neel-900 px-4 py-1.5 font-semibold no-underline">
              {l.topics[x]} <span className="font-normal text-slate">{articles.filter((a) => a.topic === x).length}</span>
            </a>
          ))}
        </nav>
        {topics.map((x) => (
          <section key={x} id={`topic-${x}`} aria-labelledby={`topic-${x}-h`} className="mt-10 scroll-mt-24">
            <h3 id={`topic-${x}-h`} className="font-display text-2xl font-bold">{l.topics[x]}</h3>
            <ul className="mt-3 max-w-4xl border-t-2 border-neel-900">
              {articles.filter((a) => a.topic === x).map((a) => (
                <li key={a.slug} className="border-b border-rule py-5">
                  {meta(a)}
                  <Link href={`/learn/${a.slug}`} lang={cond} className="mt-1 block text-2xl font-semibold leading-snug hover:underline">{a.title}</Link>
                  <p lang={cond} className="mt-1 max-w-[68ch] text-neel-700">{a.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section aria-labelledby="write-h" className="mt-14 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
        <h2 id="write-h" className="display text-3xl">{l.writeTitle}</h2>
        <p className="mt-3 max-w-[65ch] text-neel-100">
          {wA}
          <a href={`mailto:${support}?subject=${encodeURIComponent("Guide idea for Foundura")}`} className="font-semibold text-paper underline decoration-marigold decoration-2 underline-offset-4">{l.writeLink}</a>
          {wB}
        </p>
      </section>
    </div>
  );
}
