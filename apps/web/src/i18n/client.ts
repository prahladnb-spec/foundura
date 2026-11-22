"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LANG, isLang, type Lang } from "./config";
import { type Dict, getDict } from "./index";

/** Language and dictionary for client components, from the URL's [lang] segment. */
export function useT(): { lang: Lang; t: Dict } {
  const params = useParams<{ lang?: string }>();
  const lang = isLang(params?.lang) ? params.lang : DEFAULT_LANG;
  return { lang, t: getDict(lang) };
}
