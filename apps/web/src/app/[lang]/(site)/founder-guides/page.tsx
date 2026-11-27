import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { contentLang, isLang } from "@/i18n/config";
import { GUIDE_GROUPS, GUIDE_PATH, guideText } from "@/founders/guides";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("founderGuides", isLang(lang) ? lang : "en");
}

/** Every founder guide, grouped: people and places, rules and paperwork, selling abroad and closing. */
export default async function Page({ params }: { params: Params }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const d = getDict(lang);
  const t = d.founderGuides;
  const cl = contentLang(lang);
  // Guide summaries exist in English and Hindi; other languages show the English, marked.
  const summaryLang = cl === lang ? undefined : "en";
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{t.title}</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-neel-700">{t.lead}</p>
      {GUIDE_GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`} className="mt-12">
          <h2 id={`group-${g.id}`} className="display text-4xl">{t.groups[g.id]}</h2>
          <ul className="mt-5 grid gap-x-10 md:grid-cols-2">
            {g.guides.map((x) => (
              <li key={x} className="border-t border-rule py-4">
                <Link href={GUIDE_PATH[x]} className="text-lg font-semibold">{d.chrome.footer[x]}</Link>
                <p lang={summaryLang} className="mt-1 text-neel-700">{guideText[cl][x].lead}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
