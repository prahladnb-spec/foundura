import type { MatchStatus } from "@/lib/types";

const TEXT: Record<MatchStatus, string> = {
  eligible: "Eligible",
  maybe: "Check",
  not_eligible: "Not now",
};

const CLS: Record<MatchStatus, string> = {
  eligible: "stamp-eligible",
  maybe: "stamp-maybe",
  not_eligible: "stamp-not",
};

export function Stamp({ status, animate = false, delayMs = 0 }: { status: MatchStatus; animate?: boolean; delayMs?: number }) {
  return (
    <span
      className={`stamp ${CLS[status]} ${animate && status !== "not_eligible" ? "stamp-in" : ""}`}
      style={animate ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {TEXT[status]}
    </span>
  );
}
