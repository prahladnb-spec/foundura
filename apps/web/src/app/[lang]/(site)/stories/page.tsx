import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { apiOr, STARTUPS_TAG } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { StoryPublic } from "@/lib/types";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("stories", isLang(lang) ? lang : "en");
}

/** Founder stories, newest first. Each was published with the founder's consent and can be withdrawn by them. */
export default async function StoriesPage({ params }: { params: Params }) {
  const p = await params;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const d = t.stories;
  // Withdrawals clear this cache straight away (the "My startup" proxy clears the startups tag).
  const items = await apiOr<StoryPublic[]>("/stories", [], 300, [STARTUPS_TAG]);
  const [wA, wB] = d.write.split("{link}");

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      <ol className="mt-8 border-t-2 border-neel-900">
        {items.map((s) => (
          <li key={s.slug} className="border-b border-rule py-6" lang={s.lang === lang ? undefined : s.lang}>
            <h2 className="text-2xl font-semibold leading-snug">
              <Link href={`/stories/${s.slug}`}>{s.title}</Link>
            </h2>
            <p className="mt-1 text-[0.95rem] text-slate">
              {s.founderName}{s.founderRole ? `, ${s.founderRole}` : ""}, {s.startup.name}
            </p>
            <p className="mt-2 max-w-[68ch]">{s.excerpt}</p>
            <p className="mt-2 text-[0.92rem] text-slate" lang={lang}>{f(d.published, { date: fmtDate(s.publishedAt, true, lang) })}</p>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-slate">{d.empty}</li>}
      </ol>
      <p className="mt-6 text-neel-700">
        {wA}<Link href="/dashboard" className="text-neel-500 underline">{d.writeLink}</Link>{wB}
      </p>
    </div>
  );
}
