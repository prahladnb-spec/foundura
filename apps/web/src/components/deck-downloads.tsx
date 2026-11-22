"use client";

import { useState } from "react";
import { DECK_THEME_KEYS, DECK_THEMES, deckFile, type DeckTheme } from "@/documents/types";
import { useT } from "@/i18n/client";

/** Colour chooser for a deck: pick a combination, and every download link switches to it. */
export function DeckDownloads({ slug, variants }: { slug: string; variants: ("hi" | "example")[] }) {
  const { t } = useT();
  const d = t.documents;
  const [theme, setTheme] = useState<DeckTheme>("classic");
  const [before, after] = d.download.split("{format}");
  return (
    <div className="mt-6">
      <fieldset>
        <legend className="mb-2 font-semibold">{d.colours}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DECK_THEME_KEYS.map((k) => {
            const c = DECK_THEMES[k];
            return (
              <label key={k} className={`cursor-pointer rounded-lg border-2 p-1.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-neel-500 ${theme === k ? "border-neel-900" : "border-rule"}`}>
                <input type="radio" name="deck-theme" value={k} className="sr-only" checked={theme === k} onChange={() => setTheme(k)} />
                {/* A miniature slide in this combination. */}
                <span aria-hidden="true" className="block aspect-video overflow-hidden rounded border border-rule" style={{ background: `#${c.bg}` }}>
                  <span className="flex h-full">
                    <span className="w-[5%]" style={{ background: `#${c.accent}` }} />
                    <span className="flex flex-1 flex-col justify-center gap-[7%] px-[9%]">
                      <span className="h-[14%] w-4/5 rounded-sm" style={{ background: `#${c.title}` }} />
                      <span className="h-[5%] w-1/4" style={{ background: `#${c.accent}` }} />
                      <span className="h-[7%] w-3/5 rounded-sm opacity-70" style={{ background: `#${c.text}` }} />
                      <span className="h-[7%] w-1/2 rounded-sm opacity-70" style={{ background: `#${c.text}` }} />
                    </span>
                  </span>
                </span>
                <span className="mt-1.5 block text-center text-[0.88rem]">{d.themes[k]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="mt-5">
        <a href={`/downloads/${deckFile(slug, undefined, theme)}`} download className="inline-block rounded-md bg-marigold px-5 py-3 font-semibold text-neel-950 no-underline">
          {before}<span lang="en">PowerPoint</span>{after}
        </a>
      </p>
      {variants.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {variants.map((v) => (
            <a key={v} href={`/downloads/${deckFile(slug, v, theme)}`} download className="font-semibold text-neel-500 underline">
              {v === "hi" ? d.downloadHi : d.downloadExample}
            </a>
          ))}
        </p>
      )}
    </div>
  );
}
