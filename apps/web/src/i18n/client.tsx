"use client";

import { createContext, useContext } from "react";
import type { Lang } from "./config";
import type { Dict } from "./en";

const Ctx = createContext<{ lang: Lang; t: Dict } | null>(null);

/**
 * The page's language and its dictionary, handed down once by the root layout, so the browser
 * receives only the visitor's language and never the other dictionaries.
 */
export function I18nProvider({ lang, t, children }: { lang: Lang; t: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ lang, t }}>{children}</Ctx.Provider>;
}

export function useT(): { lang: Lang; t: Dict } {
  const v = useContext(Ctx);
  if (!v) throw new Error("useT outside I18nProvider");
  return v;
}
