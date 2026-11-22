import type { MatchStatus } from "@/lib/types";

const CLS: Record<MatchStatus, string> = {
  eligible: "stamp-eligible",
  maybe: "stamp-maybe",
  not_eligible: "stamp-not",
};

/** The status stamp. `label` is the page language's word for the status (t.stamp[status]). */
export function Stamp({ status, label, animate = false, delayMs = 0 }: { status: MatchStatus; label: string; animate?: boolean; delayMs?: number }) {
  return (
    <span
      className={`stamp ${CLS[status]} ${animate && status !== "not_eligible" ? "stamp-in" : ""}`}
      style={animate ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {label}
    </span>
  );
}
