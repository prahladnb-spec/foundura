/**
 * Site search: a small ranked word match over schemes, templates, guides, glossary terms and
 * listings. The whole catalogue is a few hundred items, so the web server ranks in memory and
 * nothing is sent to a search service. English and Hindi text sit in the same entry, so a query
 * in either language finds the item whichever language the page is in.
 */

export const SEARCH_KINDS = ["scheme", "template", "guide", "term", "event", "startup", "investor"] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];

export interface SearchEntry<T = unknown> {
  kind: SearchKind;
  id: string;
  /** Names, in every language the item has. */
  title: string[];
  /** Short labels people also search by: abbreviations, issuer, sector, city. */
  tags?: string[];
  /** Summaries and descriptions. */
  body?: string[];
  data: T;
}

export interface SearchHit<T = unknown> {
  entry: SearchEntry<T>;
  score: number;
}

export const SEARCH_MAX_QUERY = 100;

/**
 * Folds the differences that don't change a word: case, Latin accents, the Devanagari nukta
 * (फ़/फ), chandrabindu written as anusvara (ँ/ं) and invisible joiners.
 */
export function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-़ͯ‌‍]/g, "")
    .replace(/ँ/g, "ं")
    .toLowerCase();
}

export function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^\p{L}\p{N}\p{M}]+/u)
    .filter(Boolean);
}

/** Words that only matter when they're all there is. */
const STOP = new Set(
  (
    "a an and are as at be by can do does for from how i in is it my of on or the to what when where which who why with " +
    "का की के को में से और या है हैं पर लिए एक यह वह क्या कैसे कब कौन मेरा मेरी मेरे"
  ).split(" "),
);
const STOP_NORM = new Set([...STOP].map(normalize));

/** The words to look for, without filler words unless the query is only filler. */
export function queryTokens(q: string): string[] {
  const all = [...new Set(tokenize(q.slice(0, SEARCH_MAX_QUERY)))].slice(0, 10);
  const kept = all.filter((t) => !STOP_NORM.has(t));
  return kept.length ? kept : all;
}

const W = { title: 10, tags: 6, body: 2 } as const;

/** How well one query word matches one word of the text: whole word, start of a word, or inside a long word. */
function wordMatch(q: string, w: string): number {
  if (w === q) return 1;
  if (q.length >= 2 && w.startsWith(q)) return 0.75;
  if (q.length >= 4 && w.includes(q)) return 0.4;
  return 0;
}

interface Prepared<T> {
  entry: SearchEntry<T>;
  fields: { weight: number; words: string[] }[];
  titles: string[];
}

export class SearchIndex<T = unknown> {
  private readonly items: Prepared<T>[];

  constructor(entries: SearchEntry<T>[]) {
    this.items = entries.map((entry) => ({
      entry,
      fields: [
        { weight: W.title, words: entry.title.flatMap(tokenize) },
        { weight: W.tags, words: (entry.tags ?? []).flatMap(tokenize) },
        { weight: W.body, words: (entry.body ?? []).flatMap(tokenize) },
      ],
      titles: entry.title.map((t) => tokenize(t).join(" ")),
    }));
  }

  get size() {
    return this.items.length;
  }

  /** Every query word has to match somewhere; title matches count most. Best first. */
  search(q: string, opts: { kinds?: readonly SearchKind[]; limit?: number } = {}): SearchHit<T>[] {
    const qt = queryTokens(q);
    if (qt.length === 0) return [];
    const phrase = qt.join(" ");
    const hits: SearchHit<T>[] = [];
    for (const it of this.items) {
      if (opts.kinds && !opts.kinds.includes(it.entry.kind)) continue;
      let score = 0;
      let all = true;
      for (const t of qt) {
        let best = 0;
        for (const f of it.fields) {
          for (const w of f.words) {
            const m = wordMatch(t, w) * f.weight;
            if (m > best) best = m;
          }
        }
        if (best === 0) {
          all = false;
          break;
        }
        score += best;
      }
      if (!all) continue;
      for (const title of it.titles) {
        if (title === phrase) score += 12;
        else if (title.startsWith(phrase)) score += 6;
        else if (qt.length > 1 && title.includes(phrase)) score += 4;
      }
      hits.push({ entry: it.entry, score });
    }
    hits.sort((a, b) => b.score - a.score || a.entry.title[0].localeCompare(b.entry.title[0]));
    return opts.limit ? hits.slice(0, opts.limit) : hits;
  }
}
