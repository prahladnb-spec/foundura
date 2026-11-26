import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { getDict } from "@/i18n";
import { f, isLang, type Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { stateLabel } from "@/lib/labels";
import type { EventItem, StartupPublic } from "@/lib/types";
import { CITY_INFO } from "@/cities/directory";
import { SUPPORT } from "@/support/directory";
import { FUNDING } from "@/funding/directory";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("cities", isLang(lang) ? lang : "en");
}

/** India's main startup cities, each with its incubators, funders, events and startups. */
export default async function CitiesPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "en";
  const d = getDict(lang).cities;
  const [events, startups] = await Promise.all([apiOr<EventItem[]>("/events", []), apiOr<StartupPublic[]>("/startups", [], 0)]);
  const today = new Date().toISOString().slice(0, 10);
  const [oA, oB] = d.others.split("{link}");
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <PageIntro art="events">
        <h1 className="display text-6xl md:text-7xl">{d.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{d.lead}</p>
      </PageIntro>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CITY_INFO.map((c) => {
          const support = SUPPORT.filter((e) => c.match.test(e.base)).length + FUNDING.filter((e) => c.match.test(e.base)).length;
          const ev = events.filter((e) => e.city && c.match.test(e.city) && (e.startDate ?? e.deadline ?? "") >= today).length;
          const st = startups.filter((s) => s.city === c.id).length;
          return (
            <li key={c.id}>
              <Link href={`/cities/${c.id}`} className="block h-full rounded-xl border-2 border-neel-900 bg-white p-5 no-underline hover:bg-marigold-50">
                <span className="block font-display text-3xl font-bold text-neel-900">{c.names[lang]}</span>
                <span className="mt-1 block text-[0.9rem] text-slate">{stateLabel(c.state, lang)}</span>
                <span className="mt-3 block text-[0.95rem] text-neel-700">{f(d.counts, { a: support, b: ev, c: st })}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-10 text-neel-700">
        {oA}
        <Link href="/states" className="text-neel-500 underline">{d.othersLink}</Link>
        {oB}
      </p>
    </div>
  );
}
