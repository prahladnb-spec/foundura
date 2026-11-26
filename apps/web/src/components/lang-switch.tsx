"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { LANG_INFO, LANGS, switchPath } from "@/i18n/config";
import { useT } from "@/i18n/client";

/**
 * The language menu: the same page in every language, each named in its own language. Plain <a>
 * links, so the whole page re-renders in the chosen language. A <details> element, so it opens
 * and closes without script. The query string is added when a link is clicked rather than read
 * while rendering, so the menu is part of the page's own HTML instead of arriving later.
 */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useT();
  const pathname = usePathname() ?? "/";
  // usePathname may report the internal /en/... path on English pages; strip it.
  const visible = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return (
    <details className="lang-menu relative">
      <summary className={`flex cursor-pointer list-none items-center gap-1.5 ${className}`}>
        <Icon icon={Languages} className="h-[1.1rem] w-[1.1rem]" />
        {/* Read as "Language: English"; on phones only the icon shows. */}
        <span className="sr-only">{t.chrome.language}: </span>
        <span className="sr-only sm:not-sr-only">{LANG_INFO[lang].name}</span>
      </summary>
      <ul className="absolute end-0 z-50 mt-2 min-w-40 rounded-lg border-2 border-neel-900 bg-white py-1.5 shadow-[4px_4px_0_var(--color-neel-900)]">
        {LANGS.map((l) => (
          <li key={l}>
            <a
              href={switchPath(visible, l)}
              onClick={(e) => {
                if (location.search) e.currentTarget.href = switchPath(visible, l) + location.search;
              }}
              hrefLang={LANG_INFO[l].tag}
              lang={LANG_INFO[l].tag}
              dir={LANG_INFO[l].dir}
              aria-current={l === lang ? "true" : undefined}
              className={`block px-4 py-1.5 text-neel-900 no-underline hover:bg-neel-50 ${l === lang ? "font-semibold" : ""}`}
            >
              {LANG_INFO[l].name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
