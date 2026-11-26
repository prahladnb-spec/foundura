import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedResizer } from "@/components/embed-resizer";
import { getDict } from "@/i18n";
import { f, isLang, type Lang, lp } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange } from "@/lib/format";
import { stateLabel } from "@/lib/labels";
import type { EventItem, Scheme } from "@/lib/types";
import { CITY_INFO } from "@/cities/directory";
import { isState } from "@/funding/directory";
import { SUPPORT } from "@/support/directory";

const LISTS = ["schemes", "events", "support"] as const;
type List = (typeof LISTS)[number];
type Params = Promise<{ lang: string; list: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return LISTS.map((list) => ({ list }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "en").partners.embedTitle, robots: { index: false } };
}

/**
 * Lists for partner sites: a state's schemes, upcoming events or support organisations. Framing is
 * allowed only on /embed/* (next.config.ts); no cookies, nothing stored, links open on Foundura.
 */
export default async function EmbedList({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | undefined>> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  if (!(LISTS as readonly string[]).includes(p.list)) notFound();
  const list = p.list as List;
  const lang: Lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const d = t.partners;
  const code = sp.state?.toUpperCase();
  const st = code && isState(code) ? code : null;
  const place = st ? stateLabel(st, lang) : null;
  const en = lang === "en" ? undefined : "en";
  const out = (path: string) => `${lp(lang, path)}`;
  const [before, after] = t.scan.poweredBy.split("{link}");

  let title = "";
  let items: { key: string; href: string; name: string; meta?: string; nameLang?: string; metaLang?: string }[] = [];
  let more = { href: out("/"), label: d.embedMore };

  if (list === "schemes") {
    const schemes = await apiOr<Scheme[]>(`/schemes?lang=${lang === "hi" ? "hi" : "en"}`, []);
    const open = schemes.filter((s) => s.status !== "closed" && (st ? s.level === "state" && s.state === st : s.level === "national"));
    title = place ? f(d.embedSchemesState, { state: place }) : d.embedSchemes;
    items = open.map((s) => ({ key: s.slug, href: out(`/schemes/${s.slug}`), name: s.name, nameLang: s.contentLang === lang ? undefined : s.contentLang, meta: String(t.labels.schemeStatus[s.status]) }));
    more = { href: st ? out(`/states/${st.toLowerCase()}`) : out("/schemes"), label: d.embedMore };
  } else if (list === "events") {
    const events = await apiOr<EventItem[]>("/events", []);
    const today = new Date().toISOString().slice(0, 10);
    const cities = CITY_INFO.filter((c) => c.state === st);
    const near = (e: EventItem) => (st ? !!e.city && cities.some((c) => c.match.test(e.city!)) : e.country === "India");
    title = place ? f(d.embedEventsState, { state: place }) : d.embedEvents;
    items = events
      .filter((e) => near(e) && (e.startDate ?? e.deadline ?? "") >= today)
      .slice(0, 10)
      .map((e) => ({ key: e.slug, href: out("/events"), name: e.name, nameLang: en, metaLang: en, meta: [e.startDate ? fmtRange(e.startDate, e.endDate, lang) : fmtDate(e.deadline, true, lang), e.city].filter(Boolean).join(", ") }));
    more = { href: out("/events"), label: d.embedMore };
  } else {
    title = place ? f(d.embedSupportState, { state: place }) : d.embedSupport;
    items = SUPPORT.filter((e) => (st ? e.geo === st : e.geo === "IN")).map((e) => ({ key: e.name, href: st ? out(`/states/${st.toLowerCase()}`) : out("/states"), name: e.name, nameLang: en, meta: t.states.supportKinds[e.kind] }));
    more = { href: st ? out(`/states/${st.toLowerCase()}`) : out("/states"), label: d.embedMore };
  }

  return (
    <main className="bg-paper px-4 py-5">
      <EmbedResizer />
      <h1 className="display text-3xl">{title}</h1>
      {items.length ? (
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {items.map((i) => (
            <li key={i.key} className="py-2.5">
              <a href={i.href} target="_blank" rel="noopener" lang={i.nameLang} className="font-semibold text-neel-900 underline">{i.name}</a>
              {i.meta && <span lang={i.metaLang} className="block text-[0.9rem] text-slate">{i.meta}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-neel-700">{d.embedNone}</p>
      )}
      <p className="mt-4"><a href={more.href} target="_blank" rel="noopener" className="text-neel-500 underline">{more.label}</a></p>
      <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-slate">
        {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG */}
        <img src="/brand/foundura-mark.svg" alt="" width={22} height={22} />
        <span>
          {before}
          <a href={out("/")} target="_blank" rel="noopener" className="underline">Foundura</a>
          {after}
        </span>
      </p>
    </main>
  );
}
