"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ARTICLE_THEMES, charCount, GUIDE_TOPICS, readMinutes, SEO_LIMITS, seoChecks, wordCount } from "@foundura/shared";
import { CircleCheck, CircleX } from "lucide-react";
import { Icon } from "@/components/icons";
import { adminCall, btn, btnQuiet, field, fieldLabel } from "@/lib/admin-client";

export interface AdminArticle {
  slug: string;
  title: string;
  theme: string;
  excerpt: string;
  body: string;
  publishedAt: string | null;
  focusKeyphrase: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  topic: string;
  authorName: string | null;
  authorRole: string | null;
  authorUrl: string | null;
  authorConsentAt?: string | null;
}

const EMPTY_SEO = { focusKeyphrase: "", seoTitle: "", metaDescription: "", keywords: [] as string[], topic: "start", authorName: null, authorRole: null, authorUrl: null };
const TOPIC_NAMES: Record<string, string> = { start: "Starting up", product: "Product and customers", selling: "Selling", funding: "Funding", team: "Team", legal: "Registration, tax and law" };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

const todayIst = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export function AdminArticleEditor({ article }: { article: AdminArticle | null }) {
  // Slug the article is stored under; null until the first save.
  const [storedSlug, setStoredSlug] = useState<string | null>(article?.slug ?? null);
  const [a, setA] = useState<AdminArticle>(
    article ? { ...EMPTY_SEO, ...article } : { slug: "", title: "", theme: ARTICLE_THEMES[0], excerpt: "", body: "", publishedAt: null, ...EMPTY_SEO },
  );
  // Keywords are typed as one comma-separated line.
  const [kwText, setKwText] = useState((article?.keywords ?? []).join(", "));
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [consent, setConsent] = useState(!!article?.authorConsentAt);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AdminArticle>(k: K, v: AdminArticle[K]) => setA((p) => ({ ...p, [k]: v }));
  const words = a.body.split(/\s+/).filter(Boolean).length;

  async function save(publishedAt: string | null) {
    setBusy(true);
    setMsg(null);
    try {
      const keywords = [...new Set(kwText.split(",").map((k) => k.trim()).filter(Boolean))];
      const blank = (v: string | null) => (v && v.trim() ? v.trim() : null);
      const { authorConsentAt: _c, ...rest } = a;
      const body = { ...rest, keywords, publishedAt, authorName: blank(a.authorName), authorRole: blank(a.authorRole), authorUrl: blank(a.authorUrl), authorConsent: consent };
      const saved = await adminCall<AdminArticle>(storedSlug ? `articles/${storedSlug}` : "articles", storedSlug ? "PUT" : "POST", body);
      setA(saved);
      setStoredSlug(saved.slug);
      setMsg({ kind: "ok", text: saved.publishedAt ? `Published. It's live at /learn/${saved.slug}` : "Draft saved." });
      // Update the address without remounting, so the confirmation stays on screen.
      if (saved.slug !== storedSlug) window.history.replaceState(null, "", `/admin/articles/${saved.slug}`);
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={fieldLabel} htmlFor="title">Title</label>
        <input
          id="title"
          className={`${field} text-[1.2rem] font-semibold`}
          value={a.title}
          onChange={(e) => {
            set("title", e.target.value);
            if (!slugTouched) set("slug", slugify(e.target.value));
          }}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={fieldLabel} htmlFor="slug">Web address</label>
          <div className="flex items-center rounded-md border border-rule bg-white ps-3">
            <span className="text-slate">/learn/</span>
            <input
              id="slug"
              className="w-full rounded-e-md px-1 py-2.5"
              value={a.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="theme">Theme</label>
          <select id="theme" className={field} value={a.theme} onChange={(e) => set("theme", e.target.value)}>
            {ARTICLE_THEMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
            {!ARTICLE_THEMES.includes(a.theme as (typeof ARTICLE_THEMES)[number]) && <option>{a.theme}</option>}
          </select>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="topic">Topic</label>
          <select id="topic" className={field} value={a.topic} onChange={(e) => set("topic", e.target.value)}>
            {GUIDE_TOPICS.map((t) => (
              <option key={t} value={t}>{TOPIC_NAMES[t]}</option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="rounded-lg border border-rule bg-white p-4">
        <legend className="px-1 font-semibold">Guest author</legend>
        <p className="text-[0.9rem] text-slate">Leave the name empty for guides by the Foundura editors. A founder or investor is named only with their agreement.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={fieldLabel} htmlFor="author-name">Name</label>
            <input id="author-name" className={field} value={a.authorName ?? ""} onChange={(e) => set("authorName", e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="author-role">Role</label>
            <input id="author-role" className={field} placeholder="Founder, Shruti Hearing" value={a.authorRole ?? ""} onChange={(e) => set("authorRole", e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="author-url">Their page (https)</label>
            <input id="author-url" className={field} value={a.authorUrl ?? ""} onChange={(e) => set("authorUrl", e.target.value)} />
          </div>
        </div>
        <label className="mt-3 flex items-start gap-2">
          <input type="checkbox" className="mt-1.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>The author agreed in writing to be named and to this text being published.</span>
        </label>
      </fieldset>
      <div>
        <label className={fieldLabel} htmlFor="excerpt">Short description</label>
        <p className="mb-1 text-[0.9rem] text-slate">The excerpt: shown on the Guides page and when the article is shared. {wordCount(a.excerpt)}/{SEO_LIMITS.excerptWords} words</p>
        <textarea id="excerpt" rows={2} className={field} value={a.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
      </div>

      <SearchPanel a={a} set={set} kwText={kwText} setKwText={setKwText} />

      <div>
        <div className="flex items-end justify-between gap-4">
          <div role="tablist" aria-label="Article body" className="flex gap-1">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-t-md border border-b-0 px-4 py-2 font-semibold ${tab === t ? "border-rule bg-white text-neel-950" : "border-transparent text-neel-700"}`}
              >
                {t === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>
          <p className="pb-2 text-[0.9rem] text-slate">
            {words.toLocaleString("en-IN")} words, about {readMinutes(a.body)} min read
          </p>
        </div>
        {tab === "write" ? (
          <textarea
            aria-label="Article body in Markdown"
            rows={22}
            className={`${field} rounded-ss-none font-mono text-[0.95rem] leading-relaxed`}
            value={a.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Write in Markdown. ## for headings, - for lists, [text](https://…) for links."
          />
        ) : (
          <div className="min-h-[20rem] rounded-md rounded-ss-none border border-rule bg-white p-6">
            <div className="prose-f">
              {a.body.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown> : <p className="text-slate">Nothing to preview yet.</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-5">
        {a.publishedAt ? (
          <>
            <button type="button" disabled={busy} className={btn} onClick={() => save(a.publishedAt)}>Save changes</button>
            <button type="button" disabled={busy} className={btnQuiet} onClick={() => save(null)}>Unpublish</button>
            <a href={`/learn/${a.slug}`} target="_blank" rel="noreferrer">View live article</a>
          </>
        ) : (
          <>
            <button type="button" disabled={busy} className={btn} onClick={() => save(todayIst())}>Publish today</button>
            <button type="button" disabled={busy} className={btnQuiet} onClick={() => save(null)}>Save draft</button>
          </>
        )}
        {msg && <p role="status" className={msg.kind === "ok" ? "text-leaf" : "text-marigold-ink"}>{msg.text}</p>}
      </div>
    </div>
  );
}

/** How the article appears in search results, with the checks the SEO tests use. */
function SearchPanel({
  a,
  set,
  kwText,
  setKwText,
}: {
  a: AdminArticle;
  set: <K extends keyof AdminArticle>(k: K, v: AdminArticle[K]) => void;
  kwText: string;
  setKwText: (v: string) => void;
}) {
  const keywords = [...new Set(kwText.split(",").map((k) => k.trim()).filter(Boolean))];
  const checks = seoChecks({ ...a, keywords });
  const title = a.seoTitle.trim() || `${a.title} | Foundura`;
  const passed = checks.filter((c) => c.ok).length;
  return (
    <section aria-labelledby="search-h" className="rounded-lg border border-rule bg-white p-5">
      <h2 id="search-h" className="text-xl font-semibold">In search results</h2>
      <p className="mt-1 text-[0.92rem] text-slate">
        What Google shows for this article. Leave the SEO title empty to use the article title.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabel} htmlFor="focus">Focus keyphrase</label>
          <input id="focus" className={field} value={a.focusKeyphrase} onChange={(e) => set("focusKeyphrase", e.target.value)} placeholder="e.g. DPIIT recognition" />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="seo-title">SEO title <span className="font-normal text-slate">{charCount(title)}/{SEO_LIMITS.title}</span></label>
          <input id="seo-title" className={field} value={a.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={`${a.title} | Foundura`} />
        </div>
      </div>
      <div className="mt-4">
        <label className={fieldLabel} htmlFor="meta">
          Meta description <span className="font-normal text-slate">{charCount(a.metaDescription)} characters, aim for {SEO_LIMITS.descriptionMin} to {SEO_LIMITS.descriptionMax}</span>
        </label>
        <textarea id="meta" rows={2} className={field} value={a.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
      </div>
      <div className="mt-4">
        <label className={fieldLabel} htmlFor="keywords">
          Keywords <span className="font-normal text-slate">{keywords.length}/{SEO_LIMITS.keywords}, separated by commas</span>
        </label>
        <textarea id="keywords" rows={2} className={field} value={kwText} onChange={(e) => setKwText(e.target.value)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div aria-label="Search result preview" role="group" className="rounded-md border border-rule p-4 font-sans">
          <p className="text-[0.85rem] text-slate">foundura.org › learn › {a.slug || "…"}</p>
          <p className="mt-0.5 truncate text-[1.15rem] text-[#1a0dab]">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-[0.9rem] text-neel-700">{a.metaDescription || a.excerpt || "The meta description appears here."}</p>
        </div>
        <div>
          <p className="font-semibold">{passed} of {checks.length} checks pass</p>
          <ul className="mt-2 space-y-1 text-[0.92rem]">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <Icon icon={c.ok ? CircleCheck : CircleX} className={`mt-0.5 h-4 w-4 ${c.ok ? "text-leaf" : "text-marigold-ink"}`} />
                <span>
                  <span className="sr-only">{c.ok ? "Done: " : "To do: "}</span>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
