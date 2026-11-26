"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LANGS } from "@/i18n/config";

type Beacon = { metric: "page_view" | "template_download" | "calendar_add" | "calendar_subscribe" | "search"; key?: string };

function send(b: Beacon) {
  try {
    const body = JSON.stringify(b);
    if (!navigator.sendBeacon?.("/api/m", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/m", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {
    /* counting is best-effort */
  }
}

/** Private pages aren't counted by path, in any language. A private profile link's path holds its key, so it never leaves the browser here. */
const SKIP = new RegExp(`^/((${LANGS.join("|")})/)?(admin|dashboard|unsubscribe|signin|embed|shared|newsletter)(/|$)`);

/** What a link click counts as, if anything. */
function fromLink(href: string): Beacon | null {
  if (href.startsWith("webcal:") || /calendar\.google\.com\/calendar\/r\?cid=/.test(href)) return { metric: "calendar_subscribe" };
  if (/calendar\.google\.com\/calendar\/render/.test(href)) return { metric: "calendar_add" };
  const u = new URL(href, location.href);
  if (u.origin !== location.origin) return null;
  if (/^\/calendar\/[^/]+\.ics$/.test(u.pathname) && !u.pathname.startsWith("/calendar/foundura")) return { metric: "calendar_add" };
  const dl = u.pathname.match(/^\/downloads\/([a-z0-9-]+)\.(docx|pptx|xlsx)$/);
  if (dl) return { metric: "template_download", key: dl[1] };
  return null;
}

/**
 * Counts page views and a few clicks as anonymous daily totals. No cookies or local storage,
 * nothing that identifies the visitor, and nothing sent for private pages.
 */
export function UsageCounter() {
  const path = usePathname();

  useEffect(() => {
    if (!path || SKIP.test(path)) return;
    send({ metric: "page_view", key: path.toLowerCase().slice(0, 120) });
    // Whether a search found anything; never what was searched for.
    const outcome = document.querySelector("[data-search-outcome]")?.getAttribute("data-search-outcome");
    if (outcome === "found" || outcome === "none") send({ metric: "search", key: outcome });
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const b = fromLink(a.getAttribute("href") ?? "");
      if (b) send(b);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
