import { ArrowUpRight, BadgeCheck, CalendarDays, Users } from "lucide-react";
import Link from "@/components/locale-link";
import { Icon, KindIcon } from "@/components/icons";

export type StepLink = { href: string; label: string; kind: "doc" | "deck" | "sheet" | "scheme" | "investors" | "events"; lang?: string };
export type Step = { t: string; d: string; links?: StepLink[] };

const LINK_ICON = { scheme: BadgeCheck, investors: Users, events: CalendarDays } as const;

/**
 * A numbered sequence drawn as rubber-stamp rings joined by a dashed red-tape line: across the
 * page on wide screens, down the left on narrow ones. It's an ordered list, so the order and
 * numbers come through to screen readers too.
 */
export function Steps({ steps, label, cols }: { steps: Step[]; label: string; cols: 3 | 4 | 6 }) {
  const grid = cols === 6 ? "lg:grid-cols-6 md:grid-cols-3" : cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <ol aria-label={label} className={`steps steps-${cols} grid gap-x-6 gap-y-8 ${grid}`}>
      {steps.map((s, i) => (
        <li key={s.t} className="step relative grid grid-cols-[3.5rem_1fr] gap-x-4 md:block">
          <span aria-hidden="true" className="step-ring">{i + 1}</span>
          <div className="md:mt-4">
            <h3 className="text-lg font-semibold leading-snug">{s.t}</h3>
            <p className="mt-1 text-[0.95rem] text-neel-700">{s.d}</p>
            {s.links && s.links.length > 0 && (
              <ul className="mt-2 space-y-1 text-[0.92rem]">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} lang={l.lang} className="inline-flex items-center gap-1.5 text-neel-500 underline">
                      {l.kind === "doc" || l.kind === "deck" || l.kind === "sheet" ? (
                        <KindIcon kind={l.kind} className="h-4 w-4" />
                      ) : (
                        <Icon icon={LINK_ICON[l.kind] ?? ArrowUpRight} className="h-4 w-4" />
                      )}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
