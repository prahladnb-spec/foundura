"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { f } from "@/i18n";
import { useT } from "@/i18n/client";
import { monthGrid, monthLabel, onDay } from "@/lib/calendar";
import { fmtDate } from "@/lib/format";
import type { EventItem } from "@/lib/types";

const MAX_IN_CELL = 3;

/**
 * A month grid. Each day shows its events; choosing a day lists that day's events underneath,
 * otherwise the whole month is listed. On narrow screens the grid shows dots instead of names.
 */
export function EventsCalendar({ month, events, today, site }: { month: string; events: EventItem[]; today: string; site: string }) {
  const { lang, t } = useT();
  const ev = t.events;
  const [day, setDay] = useState<string | null>(null);
  const weeks = monthGrid(month);
  const shown = day ? events.filter((e) => onDay(e, day)) : events;

  return (
    <div>
      <div role="grid" aria-label={monthLabel(month, lang)} className="overflow-hidden rounded-xl border-2 border-neel-900 bg-white">
        <div role="row" className="grid grid-cols-7 border-b border-rule bg-neel-50 text-center text-[0.85rem] font-semibold text-neel-700">
          {ev.weekdays.map((w) => (
            <div key={w} role="columnheader" className="py-2">{w}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className="grid grid-cols-7 border-b border-rule last:border-b-0">
            {week.map((d, di) => {
              if (!d) return <div key={di} role="gridcell" aria-hidden="true" className="min-h-14 bg-paper md:min-h-28" />;
              const list = events.filter((e) => onDay(e, d));
              const selected = day === d;
              const label = f(ev.dayEvents, { date: fmtDate(d, false, lang), n: list.length });
              return (
                <div key={d} role="gridcell" className="border-l border-rule first:border-l-0">
                  <button
                    type="button"
                    onClick={() => setDay(selected ? null : d)}
                    aria-pressed={selected}
                    aria-label={label}
                    disabled={list.length === 0}
                    className={`flex h-full min-h-14 w-full flex-col items-stretch gap-1 p-1.5 text-left md:min-h-28 ${selected ? "bg-marigold-50 outline-2 -outline-offset-2 outline-neel-900" : list.length ? "hover:bg-neel-50" : ""}`}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.85rem] ${d === today ? "bg-neel-900 font-semibold text-paper" : "text-neel-700"}`}>
                      {Number(d.slice(8))}
                    </span>
                    <span aria-hidden="true" className="flex flex-wrap gap-1 md:hidden">
                      {list.slice(0, 4).map((e) => (
                        <span key={e.slug} className={`h-2 w-2 rounded-full ${e.startDate ? "bg-neel-500" : "bg-marigold"}`} />
                      ))}
                    </span>
                    <span aria-hidden="true" className="hidden flex-col gap-1 md:flex">
                      {list.slice(0, MAX_IN_CELL).map((e) => (
                        <span
                          key={e.slug}
                          lang={lang === "en" ? undefined : "en"}
                          className={`truncate rounded px-1.5 py-0.5 text-[0.78rem] leading-snug ${
                            !e.startDate ? "bg-marigold-50 text-marigold-ink" : e.status === "Confirmed" ? "bg-neel-900 text-paper" : "border border-dashed border-neel-500 text-neel-700"
                          }`}
                        >
                          {e.name}
                        </span>
                      ))}
                      {list.length > MAX_IN_CELL && <span className="text-[0.78rem] text-slate">{f(ev.more, { n: list.length - MAX_IN_CELL })}</span>}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ul aria-hidden="true" className="mt-3 hidden flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-slate md:flex">
        <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-neel-900" />{ev.key.confirmed}</li>
        <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-dashed border-neel-500" />{ev.key.verify}</li>
        <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-marigold-50 ring-1 ring-marigold" />{ev.key.deadline}</li>
      </ul>

      <section aria-live="polite" aria-labelledby="day-h" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-neel-900 pb-2">
          <h2 id="day-h" className="display text-3xl">
            {day ? fmtDate(day, true, lang) : f(ev.monthEvents, { month: monthLabel(month, lang) })}
          </h2>
          {day && (
            <button type="button" onClick={() => setDay(null)} className="text-neel-500 underline">{ev.showMonth}</button>
          )}
        </div>
        <ul>
          {shown.map((e) => (
            <li key={e.slug} className="border-b border-rule py-5">
              <EventCard e={e} t={t} lang={lang} site={site} />
            </li>
          ))}
          {shown.length === 0 && <li className="py-6 text-slate">{ev.noneInMonth}</li>}
        </ul>
      </section>
    </div>
  );
}
