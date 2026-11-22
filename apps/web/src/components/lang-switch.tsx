"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { switchPath } from "@/i18n/config";
import { useT } from "@/i18n/client";

/** Link to the same page in the other language. A plain <a>, so the whole page re-renders in that language. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useT();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams()?.toString();
  // usePathname may report the internal /en/... path on English pages; strip it.
  const visible = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  const target = lang === "en" ? "hi" : "en";
  const href = switchPath(visible, target) + (search ? `?${search}` : "");
  return (
    <a href={href} hrefLang={target === "hi" ? "hi-IN" : "en-IN"} lang={target === "hi" ? "hi-IN" : "en-IN"} aria-label={t.chrome.switchLabel} className={className}>
      {t.chrome.switchTo}
    </a>
  );
}
