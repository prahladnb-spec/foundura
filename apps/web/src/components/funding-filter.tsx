"use client";

import { useEffect } from "react";

/**
 * Filters the funding directory in place. The page renders every entry on the server; this only
 * wires up the map, region buttons, type buttons, status menu and search box, and hides what
 * doesn't match. It carries no data, so the page weighs the same in every language.
 */
export function FundingFilter({ showing, showingAll }: { showing: string; showingAll: string }) {
  useEffect(() => {
    const root = document.getElementById("funding");
    if (!root) return;
    const q = root.querySelector<HTMLInputElement>("#funding-q");
    const st = root.querySelector<HTMLSelectElement>("#funding-status");
    const count = root.querySelector<HTMLElement>("#funding-count");
    const empty = root.querySelector<HTMLElement>("#funding-empty");
    const rows = [...root.querySelectorAll<HTMLElement>("[data-entry]")];
    const groups = [...root.querySelectorAll<HTMLElement>("[data-group]")];
    const text = new Map(rows.map((r) => [r, `${r.textContent} ${r.closest("[data-group]")?.querySelector("h2")?.textContent ?? ""}`.toLowerCase()]));
    const state = { geo: "", kind: "" };

    const render = () => {
      const words = (q?.value ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      const status = st?.value ?? "";
      let shown = 0;
      for (const r of rows) {
        const s = r.dataset.status ?? "";
        const ok =
          (!state.geo || r.dataset.geo === state.geo) &&
          (!state.kind || r.dataset.kind === state.kind) &&
          (!status ||
            (status === "now" ? s === "open" || s === "rolling" : status === "periodic" ? s === "periodic" || s === "announced" : s === status)) &&
          words.every((w) => text.get(r)!.includes(w));
        r.hidden = !ok;
        if (ok) shown++;
      }
      for (const g of groups) g.hidden = !g.querySelector("[data-entry]:not([hidden])");
      if (count) count.textContent = (shown === rows.length ? showingAll : showing).replace("{n}", String(shown)).replace("{total}", String(rows.length));
      if (empty) empty.hidden = shown > 0;
      root.querySelectorAll<HTMLElement>("[data-geo-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.geoBtn === state.geo)));
      root.querySelectorAll<HTMLElement>("[data-kind-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kindBtn === state.kind)));
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const geo = t.closest<HTMLButtonElement>("[data-geo-btn]");
      const kind = t.closest<HTMLButtonElement>("[data-kind-btn]");
      if (geo && !geo.disabled) {
        state.geo = state.geo === geo.dataset.geoBtn ? "" : (geo.dataset.geoBtn ?? "");
        render();
        count?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      } else if (kind) {
        state.kind = kind.dataset.kindBtn ?? "";
        render();
      } else if (t.closest("#funding-clear")) {
        state.geo = state.kind = "";
        if (q) q.value = "";
        if (st) st.value = "";
        render();
      }
    };
    root.addEventListener("click", onClick);
    q?.addEventListener("input", render);
    st?.addEventListener("change", render);
    root.querySelector<HTMLElement>("#funding-controls")?.removeAttribute("hidden");
    render();
    return () => {
      root.removeEventListener("click", onClick);
      q?.removeEventListener("input", render);
      st?.removeEventListener("change", render);
    };
  }, [showing, showingAll]);
  return null;
}
