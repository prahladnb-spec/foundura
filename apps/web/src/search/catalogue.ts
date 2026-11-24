import "server-only";
import { SearchIndex, type SearchEntry, type SearchKind } from "@foundura/shared";
import { DOCS } from "@/documents";
import { GLOSSARY, termId } from "@/glossary";
import { type Dict, getDict, lab } from "@/i18n";
import { docText } from "@/documents/text";
import { termText } from "@/glossary";
import { LANGS, type Lang } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import type { ArticleSummary, EventItem, InvestorPublic, Scheme, StartupPublic } from "@/lib/types";
import { fmtRange } from "@/lib/format";
import { FUNDING, fundingId, isState } from "@/funding/directory";
import { CHAPTERS } from "@/basics/chapters";

/** What a result shows: a link, a title and a line or two, plus whether the text is in English. */
export interface ResultView {
  href: string;
  title: string;
  /** A local name shown after an English title, in brackets (glossary terms). */
  titleLocal?: string;
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

/** A label in every language, so a query in any of them finds it. */
const both = (pick: (d: Dict) => Record<string, unknown>, key: string | null | undefined): string[] =>
  key ? [...new Set(LANGS.map((l) => String(lab(pick(getDict(l)), key))))] : [];

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
  /** English text on a page in another language. */
  const foreign = lang !== "en";
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
          { text: s.issuer, en: foreign },
          { text: String(lab(getDict(lang).labels.category, s.category)), en: false },
        ],
        en: foreign && !(isHi && h),
      },
    });
  }

  for (const d of DOCS) {
    const all = LANGS.map((l) => docText(d, l));
    const shown = docText(d, lang);
    add("template", d.slug, {
      title: [...new Set(all.map((x) => x.title))],
      tags: [d.category],
      body: [...new Set(all.map((x) => x.summary)), d.when],
      data: { href: `/documents/${d.slug}`, title: shown.title, summary: shown.summary, docKind: d.template.kind, en: foreign && shown.en },
    });
  }

  for (const a of articles) {
    add("guide", a.slug, {
      title: [a.title],
      tags: [a.theme],
      body: [a.excerpt],
      data: { href: `/learn/${a.slug}`, title: a.title, summary: a.excerpt, en: foreign },
    });
  }

  for (const g of GLOSSARY) {
    const all = LANGS.map((l) => termText(g, l));
    const shown = termText(g, lang);
    add("term", g.term, {
      title: [g.term, ...all.flatMap((x) => (x.name ? [x.name] : []))],
      body: [...new Set(all.map((x) => x.def))],
      data: { href: `/glossary#${termId(g.term)}`, title: g.term, titleLocal: shown.name, summary: shown.def, en: foreign, summaryEn: foreign && shown.en },
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
        en: foreign,
      },
    });
  }

  for (const s of startups) {
    add("startup", s.slug, {
      title: [s.name],
      tags: [...s.sectors.flatMap((x) => both((d) => d.labels.sector, x)), ...both((d) => d.labels.state, s.state)],
      body: [s.oneLiner ?? "", s.description ?? ""],
      data: { href: `/startups/${s.slug}`, title: s.name, summary: s.oneLiner ?? s.description ?? "", en: foreign },
    });
  }

  for (const i of investors) {
    add("investor", i.slug, {
      title: [i.name, i.firm ?? ""],
      tags: [...i.sectors.flatMap((x) => both((d) => d.labels.sector, x)), ...both((d) => d.labels.investorType, i.type)],
      body: [i.bio ?? ""],
      data: { href: `/investors/${i.slug}`, title: i.firm ? `${i.name}, ${i.firm}` : i.name, summary: i.bio ?? "", en: foreign },
    });
  }

  // Funding basics chapters, in English and Hindi.
  for (const c of CHAPTERS) {
    const shown = isHi ? c.hi : c.en;
    add("guide", `basics-${c.slug}`, {
      title: [c.en.title, c.hi.title],
      tags: [...c.en.keywords, ...c.hi.keywords],
      body: [c.en.summary, c.hi.summary],
      data: { href: `/basics/${c.slug}`, title: shown.title, summary: shown.summary, en: foreign && !isHi },
    });
  }

  // The funding directory: entries are English; kind and place labels in every language.
  for (const e of FUNDING) {
    const place = isState(e.geo) ? both((d) => d.labels.state, e.geo) : both((d) => d.funding.regions, e.geo);
    add("funding", fundingId(e), {
      title: [e.name],
      tags: [e.base, ...both((d) => d.funding.kinds, e.kind), ...place],
      body: [e.stage, e.focus, e.offer],
      data: {
        href: `/funding#${fundingId(e)}`,
        title: e.name,
        summary: e.offer,
        meta: [{ text: isState(e.geo) ? String(lab(getDict(lang).labels.state, e.geo)) : getDict(lang).funding.regions[e.geo], en: false }],
        en: foreign,
      },
    });
  }

  return new SearchIndex(entries);
}
