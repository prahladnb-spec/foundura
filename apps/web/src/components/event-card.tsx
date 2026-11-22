import type { Dict } from "@/i18n/en";
import { f, lab } from "@/i18n";
import { googleAddLink } from "@/lib/calendar";
import { fmtDate, fmtRange } from "@/lib/format";
import type { EventItem } from "@/lib/types";

/** One event: dates, place, who it suits, status, source, and links to add it to a calendar. */
export function EventCard({ e, t, lang, site, compactDate = false }: { e: EventItem; t: Dict; lang: "en" | "hi"; site: string; compactDate?: boolean }) {
  const ev = t.events;
  const cond = lang === "en" ? undefined : "en";
  const google = googleAddLink(e, site);
  const place = e.format === "Online" ? lab(ev.formats, "Online") : [e.city, e.country !== "India" ? e.country : null].filter(Boolean).join(", ");
  return (
    <div className={compactDate ? "" : "grid gap-2 md:grid-cols-[10rem_1fr]"}>
      <div className="font-semibold text-neel-700">
        {e.startDate ? fmtRange(e.startDate, e.endDate, lang) : `${ev.deadline}: ${fmtDate(e.deadline, true, lang)}`}
        {e.startDate && e.deadline && <span className="block text-[0.9rem] text-marigold-ink">{f(ev.applyBy, { date: fmtDate(e.deadline, true, lang) })}</span>}
      </div>
      <div>
        <p lang={cond} className="text-lg font-semibold leading-snug">{e.name}</p>
        <p className="text-[0.93rem] text-slate">
          <span lang={cond}>{place}</span>
          {place && ", "}
          <span lang={cond}>{e.type}</span>
          {e.format === "Hybrid" && <>, {lab(ev.formats, "Hybrid")}</>}
        </p>
        {e.bestFor && <p className="mt-1">{ev.bestFor.split("{v}")[0]}<span lang={cond}>{e.bestFor}</span>{ev.bestFor.split("{v}")[1]}</p>}
        {e.notes && <p lang={cond} className="text-neel-700">{e.notes}</p>}
        <p className="mt-1 text-[0.88rem] text-slate">
          {e.status in ev.status ? `${lab(ev.status, e.status)}${lang === "hi" ? "। " : ". "}` : ""}
          {e.sourceUrl && (
            <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {t.common.source.split("{name}")[0]}
              <span lang={cond}>{e.sourceName}</span>
            </a>
          )}
        </p>
        {e.status !== "Cancelled" && (
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem]">
            {google && <a href={google} target="_blank" rel="noopener noreferrer" className="text-neel-500 underline">{ev.addGoogle}</a>}
            <a href={`/calendar/${e.slug}.ics`} className="text-neel-500 underline">{ev.addIcs}</a>
          </p>
        )}
      </div>
    </div>
  );
}
