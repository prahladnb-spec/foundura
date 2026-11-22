const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-12-02" → "2 Dec 2026" (string-based, so no time-zone shifts). */
export function fmtDate(iso: string | null | undefined, withYear = true): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
}

/** "2–3 Dec 2026", "30 Nov – 2 Dec 2026", or one date. */
export function fmtRange(start: string | null, end: string | null): string {
  if (!start) return "";
  if (!end || end === start) return fmtDate(start);
  const [ys, ms] = start.split("-");
  const [ye, me] = end.split("-");
  if (ys === ye && ms === me) return `${Number(start.slice(8, 10))}–${fmtDate(end)}`;
  if (ys === ye) return `${fmtDate(start, false)} – ${fmtDate(end)}`;
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  recognition: "Recognition",
  tax: "Tax",
  grant: "Grant",
  loan: "Loan",
  fund: "Fund",
  ipr: "IP",
  procurement: "Selling to government",
  regulatory: "Compliance",
  state_policy: "State policy",
};

export const SCHEME_STATUS_LABEL: Record<string, string> = {
  open: "Open",
  rolling: "Apply any time",
  closed: "Closed for now",
  indirect: "Through investors",
};
