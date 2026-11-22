import { getDict } from "@/i18n";
import type { Lang } from "@/i18n/config";
import type { MatchStatus } from "@/lib/types";

const CLS: Record<MatchStatus, string> = {
  eligible: "stamp-eligible",
  maybe: "stamp-maybe",
  not_eligible: "stamp-not",
};

export function Stamp({ status, lang = "en", animate = false, delayMs = 0 }: { status: MatchStatus; lang?: Lang; animate?: boolean; delayMs?: number }) {
  return (
    <span
      className={`stamp ${CLS[status]} ${animate && status !== "not_eligible" ? "stamp-in" : ""}`}
      style={animate ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {getDict(lang).stamp[status]}
    </span>
  );
}
