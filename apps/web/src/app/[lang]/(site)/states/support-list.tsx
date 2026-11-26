import { getDict } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { legalDetails } from "@/lib/legal";
import type { SupportEntry } from "@/support/directory";

/** Support organisations as a list: name, kind, host, what they offer, and a way to report a change. */
export function SupportList({ entries, lang, en }: { entries: SupportEntry[]; lang: Lang; en?: string }) {
  const t = getDict(lang);
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  return (
    <ul className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
      {entries.map((e) => (
        <li key={e.name} className="border-t-2 border-neel-900 pt-3">
          <p className="text-[0.85rem] font-semibold text-slate">{t.states.supportKinds[e.kind]}</p>
          <h3 className="text-lg font-semibold" lang={en}>
            {e.url ? <a href={e.url} className="underline">{e.name}</a> : e.name}
          </h3>
          <p className="text-[0.9rem] text-slate" lang={en}>{e.base}</p>
          <p className="mt-1 text-neel-700" lang={en}>{e.offer}</p>
          <a href={`mailto:${support}?subject=${encodeURIComponent(`Support directory: ${e.name}`)}`} className="mt-1 inline-block text-[0.85rem] text-slate underline">
            {t.funding.report}
            <span className="sr-only" lang={en}>: {e.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
