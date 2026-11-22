"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ARTICLE_THEMES, readMinutes } from "@foundura/shared";
import { adminCall, btn, btnQuiet, field, fieldLabel } from "@/lib/admin-client";

export interface AdminArticle {
  slug: string;
  title: string;
  theme: string;
  excerpt: string;
  body: string;
  publishedAt: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

const todayIst = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export function AdminArticleEditor({ article }: { article: AdminArticle | null }) {
  // Slug the article is stored under; null until the first save.
  const [storedSlug, setStoredSlug] = useState<string | null>(article?.slug ?? null);
  const [a, setA] = useState<AdminArticle>(
    article ?? { slug: "", title: "", theme: ARTICLE_THEMES[0], excerpt: "", body: "", publishedAt: null },
  );
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AdminArticle>(k: K, v: AdminArticle[K]) => setA((p) => ({ ...p, [k]: v }));
  const words = a.body.split(/\s+/).filter(Boolean).length;

  async function save(publishedAt: string | null) {
    setBusy(true);
    setMsg(null);
    try {
      const body = { ...a, publishedAt };
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={fieldLabel} htmlFor="slug">Web address</label>
          <div className="flex items-center rounded-md border border-rule bg-white pl-3">
            <span className="text-slate">/learn/</span>
            <input
              id="slug"
              className="w-full rounded-r-md px-1 py-2.5"
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
      </div>
      <div>
        <label className={fieldLabel} htmlFor="excerpt">Short description</label>
        <p className="mb-1 text-[0.9rem] text-slate">Shown on the Learn page and in search results. {a.excerpt.length}/300</p>
        <textarea id="excerpt" rows={2} className={field} value={a.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
      </div>

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
            className={`${field} rounded-tl-none font-mono text-[0.95rem] leading-relaxed`}
            value={a.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Write in Markdown. ## for headings, - for lists, [text](https://…) for links."
          />
        ) : (
          <div className="min-h-[20rem] rounded-md rounded-tl-none border border-rule bg-white p-6">
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
