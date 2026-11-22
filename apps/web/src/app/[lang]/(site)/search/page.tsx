import { BookA, BookOpen, CalendarDays, Handshake, Landmark, Search, Store, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { SEARCH_KINDS, SEARCH_MAX_QUERY, type SearchKind } from "@foundura/shared";
import { PageIntro } from "@/components/art";
import { Icon, KindIcon } from "@/components/icons";
import Link from "@/components/locale-link";
import { f, getDict } from "@/i18n";
import { isLang, lp, type Lang } from "@/i18n/config";
import { catalogue } from "@/search/catalogue";
import { alternates } from "@/seo";

type Params = Promise<{ lang: string }>;
type Search = Promise<{ q?: string | string[]; type?: string }>;

const LIMIT = 40;

/** The script a query is written in, so screen readers read it in the right voice. */
function queryLang(q: string, page: Lang): string | undefined {
  if (/[\u0900-\u097f]/.test(q)) return "hi";
  if (/[\u0600-\u06ff]/.test(q)) return "ar";
  if (/[\u0590-\u05ff]/.test(q)) return "he";
  // Latin letters: the page's own language on Spanish and German pages, else English.
  return page === "es" || page === "de" ? undefined : page === "en" ? undefined : "en";
}

/** "Nothing matches “{q}”" with the query marked in its own language. */
function withQuery(template: string, q: string, page: Lang) {
  const [before, after] = template.split("{q}");
  const ql = queryLang(q, page);
  return (
    <>
      {before}
      <bdi lang={ql === page ? undefined : ql}>{q}</bdi>
      {after}
    </>
  );
}
const ICONS: Record<Exclude<SearchKind, "template">, LucideIcon> = {
  scheme: Landmark,
  guide: BookOpen,
  term: BookA,
  event: CalendarDays,
  startup: Store,
  investor: Handshake,
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  // Result pages are for visitors, not search engines.
  return { title: getDict(lang).search.title, robots: { index: false, follow: true }, alternates: alternates("/search", lang) };
}

export default async function SearchPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang);
  const s = t.search;
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "")).trim().slice(0, SEARCH_MAX_QUERY);
  const type = (SEARCH_KINDS as readonly string[]).includes(sp.type ?? "") ? (sp.type as SearchKind) : null;

  const hits = q ? (await catalogue(lang)).search(q) : [];
  const counts = new Map<SearchKind, number>();
  for (const h of hits) counts.set(h.entry.kind, (counts.get(h.entry.kind) ?? 0) + 1);
  const shown = (type ? hits.filter((h) => h.entry.kind === type) : hits).slice(0, LIMIT);
  const total = type ? (counts.get(type) ?? 0) : hits.length;
  const href = (over: { q?: string; type?: SearchKind | null }) => {
    const p = new URLSearchParams({ q: over.q ?? q });
    const ty = over.type === undefined ? type : over.type;
    if (ty) p.set("type", ty);
    return `/search?${p}`;
  };
  const chip = (label: string, active: boolean, to: string) => (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-3.5 py-1 text-[0.93rem] no-underline ${active ? "border-neel-900 bg-neel-900 text-paper" : "border-rule bg-white text-neel-900"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10" data-search-outcome={q ? (hits.length ? "found" : "none") : undefined}>
      <PageIntro art="glossary">
        <h1 className="display text-6xl md:text-7xl">{s.title}</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-neel-700">{s.lead}</p>
      </PageIntro>

      <form role="search" action={lp(lang, "/search")} method="get" className="mt-6">
        <label htmlFor="q" className="mb-1.5 block font-semibold">{s.label}</label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={SEARCH_MAX_QUERY}
            placeholder={s.placeholder}
            enterKeyHint="search"
            className="min-w-0 flex-1 rounded-md border-2 border-neel-900 bg-white px-3.5 py-2.5 text-lg"
          />
          {type && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper">
            <Icon icon={Search} className="h-5 w-5" />
            {s.button}
          </button>
        </div>
      </form>

      {!q && (
        <section aria-labelledby="popular-h" className="mt-10">
          <h2 id="popular-h" className="text-xl font-semibold">{s.popular}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {s.popularItems.map((p) => (
              <li key={p}>{chip(p, false, href({ q: p, type: null }))}</li>
            ))}
          </ul>
        </section>
      )}

      {q && (
        <section aria-labelledby="results-h" className="mt-8">
          <h2 id="results-h" className="text-xl font-semibold">
            {withQuery(hits.length === 0 ? s.none : f(total === 1 ? s.countOne : s.count, { n: total }), q, lang)}
          </h2>

          {hits.length === 0 ? (
            <div className="mt-3">
              <p className="text-neel-700">{s.noneHelp}</p>
              <ul className="mt-2 list-disc space-y-1 ps-5">
                <li><Link href="/scan" className="text-neel-500 underline">{s.noneLinks.scan}</Link></li>
                <li><Link href="/schemes" className="text-neel-500 underline">{s.noneLinks.schemes}</Link></li>
                <li><Link href="/glossary" className="text-neel-500 underline">{s.noneLinks.glossary}</Link></li>
              </ul>
            </div>
          ) : (
            <>
              {counts.size > 1 && (
                <nav aria-label={s.show} className="mt-4 flex flex-wrap gap-2">
                  {chip(`${s.all} (${hits.length})`, type === null, href({ type: null }))}
                  {SEARCH_KINDS.filter((k) => counts.has(k)).map((k) => (
                    <span key={k}>{chip(`${s.kinds[k]} (${counts.get(k)})`, type === k, href({ type: k }))}</span>
                  ))}
                </nav>
              )}
              <ol className="mt-4 border-t-2 border-neel-900">
                {shown.map(({ entry: { kind, id, data } }) => (
                  <li key={`${kind}:${id}`} className="relative border-b border-rule py-4">
                    <p className="flex items-start gap-1.5 text-[0.88rem] text-slate">
                      {kind === "template" ? <KindIcon kind={data.docKind ?? "doc"} className="mt-0.5 h-4 w-4" /> : <Icon icon={ICONS[kind]} className="mt-0.5 h-4 w-4" />}
                      <span>
                        {s.kind[kind]}
                        {data.meta?.map((m) => (
                          <span key={m.text}>
                            {", "}
                            <span lang={m.en ? "en" : undefined}>{m.text}</span>
                          </span>
                        ))}
                      </span>
                    </p>
                    <h3 className="mt-0.5 text-lg font-semibold leading-snug">
                      <Link href={data.href} className="text-neel-900 no-underline after:absolute after:inset-0 hover:underline">
                        <span lang={data.en ? "en" : undefined}>{data.title}</span>
                        {data.titleLocal && <span className="font-normal text-slate"> ({data.titleLocal})</span>}
                      </Link>
                    </h3>
                    {data.summary && (
                      <p lang={(data.summaryEn ?? data.en) ? "en" : undefined} className="mt-1 line-clamp-2 max-w-[70ch] text-[0.95rem] text-neel-700">
                        {data.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              {total > shown.length && <p className="mt-3 text-[0.92rem] text-slate">{f(s.capped, { n: shown.length })}</p>}
            </>
          )}
        </section>
      )}
    </div>
  );
}
