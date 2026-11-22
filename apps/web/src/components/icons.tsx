import {
  BadgeCheck,
  FileText,
  HandCoins,
  Landmark,
  Lightbulb,
  type LucideIcon,
  MapPin,
  MapPinned,
  MonitorPlay,
  PiggyBank,
  Presentation,
  ReceiptIndianRupee,
  ScrollText,
  Sheet,
  Store,
  Combine,
} from "lucide-react";

/**
 * Icons. One line-icon family (lucide) drawn at the ink colour with a slightly heavier stroke, so
 * they sit with the illustrations. Icons next to text are decorative (aria-hidden); the text says it.
 */
export const ICON_STROKE = 2.25;

export function Icon({ icon: I, className = "h-5 w-5" }: { icon: LucideIcon; className?: string }) {
  return <I aria-hidden="true" strokeWidth={ICON_STROKE} className={`shrink-0 ${className}`} />;
}

/* Scheme categories: a glyph and a colour family for each. */
const CATEGORY: Record<string, { icon: LucideIcon; tone: string }> = {
  grant: { icon: HandCoins, tone: "money" },
  loan: { icon: Landmark, tone: "money" },
  fund: { icon: PiggyBank, tone: "money" },
  tax: { icon: ReceiptIndianRupee, tone: "money" },
  recognition: { icon: BadgeCheck, tone: "official" },
  regulatory: { icon: ScrollText, tone: "official" },
  ipr: { icon: Lightbulb, tone: "market" },
  procurement: { icon: Store, tone: "market" },
  state_policy: { icon: MapPinned, tone: "state" },
};

/**
 * A scheme's category as a small postage stamp: perforated edge, glyph and label.
 * The perforations come from a CSS mask (.postage in globals.css).
 */
export function CategoryStamp({ category, label }: { category: string; label: string }) {
  const c = CATEGORY[category] ?? { icon: BadgeCheck, tone: "official" };
  return (
    <span className="postage-wrap">
      <span className={`postage postage-${c.tone}`}>
        <span className="postage-in">
          <Icon icon={c.icon} className="h-4 w-4" />
          {label}
        </span>
      </span>
    </span>
  );
}

/* Template file types. */
const KIND: Record<string, LucideIcon> = { doc: FileText, sheet: Sheet, deck: Presentation };
const KIND_TONE: Record<string, string> = { doc: "text-neel-500", sheet: "text-leaf", deck: "text-marigold-ink" };

export function KindIcon({ kind, className = "h-4 w-4" }: { kind: string; className?: string }) {
  return <Icon icon={KIND[kind] ?? FileText} className={`${className} ${KIND_TONE[kind] ?? ""}`} />;
}

/* Event formats. */
const FORMAT: Record<string, LucideIcon> = { "In person": MapPin, Online: MonitorPlay, Hybrid: Combine };

export function FormatIcon({ format, className = "h-4 w-4" }: { format: string; className?: string }) {
  return <Icon icon={FORMAT[format] ?? MapPin} className={className} />;
}

/**
 * A monogram stamp for a startup without a logo: up to two initials in a round rubber-stamp ring,
 * in one of four inks picked from the name so the same startup always looks the same.
 */
const INKS = ["text-neel-500", "text-leaf", "text-marigold-ink", "text-tape"];

export function Monogram({ name, className = "h-12 w-12" }: { name: string; className?: string }) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).filter(Boolean);
  const letters = ((words[0]?.[0] ?? "") + (words.length > 1 ? words[1][0] : (words[0]?.[1] ?? ""))).toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span aria-hidden="true" className={`monogram ${INKS[h % INKS.length]} ${className}`}>
      <span className="font-display">{letters}</span>
    </span>
  );
}
