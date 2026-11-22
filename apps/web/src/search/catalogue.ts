import "server-only";
import { SearchIndex, type SearchEntry, type SearchKind } from "@foundura/shared";
import { DOCS } from "@/documents";
import { GLOSSARY, termId } from "@/glossary";
import { getDict, lab } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import type { ArticleSummary, EventItem, InvestorPublic, Scheme, StartupPublic } from "@/lib/types";
import { fmtRange } from "@/lib/format";

/** What a result shows: a link, a title and a line or two, plus whether the text is in English. */
export interface ResultView {
  href: string;
  title: string;
  /** A Hindi name shown after an English title, in brackets. */
  titleHi?: string;
  /** Only for templates: the file type, for the icon. */
  docKind?: "doc" | "sheet" | "deck";
  summary: string;
  /** Short facts after the kind, each marked when it's English on a Hindi page. */
  meta?: { text: string; en: boolean }[];
  /** The title is English on a Hindi page. */
  en: boolean;
  /** The summary is English on a Hindi page (defaults to `en`). */
  summaryEn?: boolean;
}

const en = getDict("en");
const hi = getDict("hi");
/** A label in both languages, so either finds it. */
const both = (pick: (d: typeof en) => Record<string, unknown>, key: string | null | undefined): string[] =>
  key ? [String(lab(pick(en), key)), String(lab(pick(hi), key))] : [];

/**
 * Everything the search covers, for one page language. Lists come from the API through the same
 * short cache the listing pages use, so a search costs no extra database work most of the time.
 */
export async function catalogue(lang: Lang): Promise<SearchIndex<ResultView>> {
  const [schemesEn, schemesHi, articles, events, startups, investors] = await Promise.all([
    apiOr<Scheme[]>("/schemes?lang=en", [], 600),
    apiOr<Scheme[]>("/schemes?lang=hi", [], 600),
    apiOr<ArticleSummary[]>("/articles", [], 600),
    apiOr<EventItem[]>("/events", [], 300),
    apiOr<StartupPublic[]>("/startups", [], 300),
    apiOr<InvestorPublic[]>("/investors", [], 300),
  ]);
  const isHi = lang === "hi";
  const entries: SearchEntry<ResultView>[] = [];
  const add = (kind: SearchKind, id: string, e: Omit<SearchEntry<ResultView>, "kind" | "id">) => entries.push({ kind, id, ...e });

  const hiScheme = new Map(schemesHi.filter((s) => s.contentLang === "hi").map((s) => [s.slug, s]));
  for (const s of schemesEn) {
    const h = hiScheme.get(s.slug);
    const shown = isHi && h ? h : s;
    add("scheme", s.slug, {
      title: [s.name, ...(h ? [h.name] : [])],
      tags: [s.issuer, ...both((d) => d.labels.category, s.category), ...both((d) => d.labels.state, s.state)],
      body: [s.summary, ...s.benefits, ...(h ? [h.summary, ...h.benefits] : [])],
      data: {
        href: `/schemes/${s.slug}`,
        title: shown.name,
        summary: shown.summary,
        meta: [
          { text: s.issuer, en: isHi },
          { text: String(lab(getDict(lang).labels.category, s.category)), en: false },
        ],
        en: isHi && !h,
      },
    });
  }

  for (const d of DOCS) {
    add("template", d.slug, {
      title: [d.title, d.titleHi],
      tags: [d.category],
      body: [d.summary, d.summaryHi, d.when],
      data: { href: `/documents/${d.slug}`, title: isHi ? d.titleHi : d.title, summary: isHi ? d.summaryHi : d.summary, docKind: d.template.kind, en: false },
    });
  }

  for (const a of articles) {
    add("guide", a.slug, {
      title: [a.title],
      tags: [a.theme],
      body: [a.excerpt],
      data: { href: `/learn/${a.slug}`, title: a.title, summary: a.excerpt, en: isHi },
    });
  }

  for (const g of GLOSSARY) {
    add("term", g.term, {
      title: [g.term, ...(g.hi ? [g.hi] : [])],
      body: [g.en, g.hiDef],
      data: { href: `/glossary#${termId(g.term)}`, title: g.term, titleHi: isHi ? g.hi : undefined, summary: isHi ? g.hiDef : g.en, en: isHi, summaryEn: false },
    });
  }

  for (const e of events) {
    add("event", e.slug, {
      title: [e.name],
      tags: [e.city ?? "", e.country, e.type, e.format],
      body: [e.bestFor ?? "", e.notes ?? ""],
      data: {
        href: `/events?view=list#event-${e.slug}`,
        title: e.name,
        summary: [e.city, e.country].filter(Boolean).join(", "),
        meta: e.startDate ? [{ text: fmtRange(e.startDate, e.endDate, lang), en: false }] : undefined,
        en: isHi,
      },
    });
  }

  for (const s of startups) {
    add("startup", s.slug, {
      title: [s.name],
      tags: [...s.sectors.flatMap((x) => both((d) => d.labels.sector, x)), ...both((d) => d.labels.state, s.state)],
      body: [s.oneLiner ?? "", s.description ?? ""],
      data: { href: `/startups/${s.slug}`, title: s.name, summary: s.oneLiner ?? s.description ?? "", en: isHi },
    });
  }

  for (const i of investors) {
    add("investor", i.slug, {
      title: [i.name, i.firm ?? ""],
      tags: [...i.sectors.flatMap((x) => both((d) => d.labels.sector, x)), ...both((d) => d.labels.investorType, i.type)],
      body: [i.bio ?? ""],
      data: { href: `/investors/${i.slug}`, title: i.firm ? `${i.name}, ${i.firm}` : i.name, summary: i.bio ?? "", en: isHi },
    });
  }

  return new SearchIndex(entries);
}
