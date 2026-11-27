import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { api, ApiError, STARTUPS_TAG } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { legalDetails } from "@/lib/legal";
import type { StoryPublic } from "@/lib/types";
import { clip, keywordList, seoMetadata, seoTitle } from "@/seo";

type Params = Promise<{ slug: string; lang: string }>;

async function load(slug: string): Promise<StoryPublic> {
  try {
    // Withdrawals clear this cache straight away (the "My startup" proxy clears the startups tag).
    return await api<StoryPublic>(`/stories/${encodeURIComponent(slug)}`, { tags: [STARTUPS_TAG] });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const s = await load(p.slug);
  const first = (s.body ?? "").split(/\n\s*\n/)[0];
  return seoMetadata(`/stories/${s.slug}`, lang, {
    focus: s.title,
    title: seoTitle(s.title),
    description: clip(first),
    excerpt: clip(first),
    keywords: keywordList([s.title, s.startup.name, s.founderName], ["founder stories", "Indian startups", "Foundura"]),
    type: "article",
    published: s.publishedAt,
  });
}

/** One founder story, in the founder's words, with a way for anyone named in it to ask for a change. */
export default async function StoryPage({ params }: { params: Params }) {
  const p = await params;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const d = getDict(lang).stories;
  const s = await load(p.slug);
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  // Requests come by email, so the site stores nothing about whoever asks.
  const mail = `mailto:${support}?subject=${encodeURIComponent(`Founder story: ${s.title}`)}`;
  const [rA, rB] = d.removal.split("{link}");
  const storyLang = s.lang === lang ? undefined : s.lang;

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <p><Link href="/stories" className="text-neel-500 underline">{d.title}</Link></p>
      <div lang={storyLang}>
        <h1 className="display mt-3 text-5xl md:text-6xl">{s.title}</h1>
        <p className="mt-3 text-lg text-neel-700">
          {s.founderName}{s.founderRole ? `, ${s.founderRole}` : ""}, {s.startup.name}
        </p>
      </div>
      <p className="mt-1 text-[0.95rem] text-slate">{f(d.published, { date: fmtDate(s.publishedAt, true, lang) })}</p>
      <div lang={storyLang} className="mt-8 space-y-5 text-[1.08rem] leading-relaxed">
        {(s.body ?? "").split(/\n\s*\n/).map((para, i) => <p key={i} className="whitespace-pre-line">{para.trim()}</p>)}
      </div>
      {s.startup.slug && (
        <p className="mt-8"><Link href={`/startups/${s.startup.slug}`} className="text-neel-500 underline">{d.profile}</Link></p>
      )}
      <aside className="mt-10 border-t border-rule pt-5 text-[0.95rem] text-slate">
        <p>{d.consentNote}</p>
        <p className="mt-2">{rA}<a href={mail} className="underline">{d.removalLink}</a>{rB}</p>
      </aside>
    </article>
  );
}
