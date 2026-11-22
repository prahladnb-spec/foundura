import { INDIAN_STATES } from "@foundura/shared";
import { CategoryStamp } from "@/components/icons";
import { type Dict, f, lab, plural } from "@/i18n";
import type { Scheme } from "@/lib/types";

/**
 * India as a tile map: every state and union territory is one equal tile, placed roughly where it
 * sits. Equal tiles avoid drawing borders (maps of India must show the official Survey of India
 * boundaries) and give small states the same space as large ones.
 * [column, row] on an 8 × 7 grid.
 */
const TILES: Record<string, [number, number]> = {
  JK: [1, 0], LA: [2, 0],
  CH: [0, 1], PB: [1, 1], HP: [2, 1], UT: [3, 1],
  RJ: [0, 2], HR: [1, 2], DL: [2, 2], UP: [3, 2], BR: [4, 2], SK: [5, 2], AR: [7, 2],
  GJ: [0, 3], MP: [1, 3], CT: [2, 3], JH: [3, 3], WB: [4, 3], AS: [6, 3], NL: [7, 3],
  DH: [0, 4], MH: [1, 4], TG: [2, 4], OR: [3, 4], ML: [6, 4], MN: [7, 4],
  GA: [0, 5], KA: [1, 5], AP: [2, 5], TR: [6, 5], MZ: [7, 5],
  LD: [0, 6], KL: [1, 6], TN: [2, 6], PY: [3, 6], AN: [5, 6],
};

const shade = (n: number) => (n >= 3 ? "tile-3" : n === 2 ? "tile-2" : n === 1 ? "tile-1" : "tile-0");

export function SchemeTileMap({ schemes, t }: { schemes: Scheme[]; t: Dict }) {
  const s = t.schemes;
  const perState = new Map<string, number>();
  for (const x of schemes) if (x.level === "state" && x.state) perState.set(x.state, (perState.get(x.state) ?? 0) + 1);
  const central = schemes.filter((x) => x.level === "national").length;

  const byType = new Map<string, number>();
  for (const x of schemes) byType.set(x.category, (byType.get(x.category) ?? 0) + 1);
  const types = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...types.map(([, n]) => n));

  return (
    <section aria-labelledby="map-h" className="mt-10 grid gap-10 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div>
        <h2 id="map-h" className="display text-3xl">{s.mapTitle}</h2>
        <p className="mt-1 max-w-[42ch] text-[0.95rem] text-slate">{s.mapLead}</p>
        {/* A map keeps west on the left in every language. */}
        <nav aria-label={s.mapLabel} dir="ltr" className="tile-map mt-5">
          {INDIAN_STATES.map(({ value }) => {
            const pos = TILES[value];
            if (!pos) return null;
            const n = perState.get(value) ?? 0;
            const name = String(lab(t.labels.state, value));
            const style = { gridColumn: pos[0] + 1, gridRow: pos[1] + 1 };
            return n > 0 ? (
              <a
                key={value}
                href={`#state-${value}`}
                style={style}
                className={`tile ${shade(n)}`}
                title={name}
              >
                {/* The name starts with the code people see, then says the state and count in full. */}
                <span lang="en">{value}</span>
                <span className="sr-only">, {f(plural(n, s.mapStateOne, s.mapStateMany), { state: name })}</span>
                <span className="tile-n" aria-hidden="true">{n}</span>
              </a>
            ) : (
              <span key={value} style={style} className="tile tile-0" title={name} aria-hidden="true">
                <span lang="en">{value}</span>
              </span>
            );
          })}
        </nav>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.88rem] text-slate">
          <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="tile tile-0 tile-key" />{s.mapLegendNone}</span>
          <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="tile tile-2 tile-key" />{s.mapLegendSome}</span>
        </p>
        <p className="mt-3 font-semibold">
          <a href="#central" className="text-neel-700 underline">{f(s.mapCentral, { n: central })}</a>
        </p>
      </div>

      <div className="min-w-0">
        <h2 className="display text-3xl">{s.typesTitle}</h2>
        <p className="mt-1 text-[0.95rem] text-slate">{f(s.typesLead, { n: schemes.length })}</p>
        <ul className="mt-5 space-y-3">
          {types.map(([cat, n]) => (
            <li key={cat} className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[11rem_minmax(0,1fr)_2rem]">
              <span><CategoryStamp category={cat} label={String(lab(t.labels.category, cat))} /></span>
              <span aria-hidden="true" className="ledger-bar col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"><span style={{ width: `${(n / max) * 100}%` }} /></span>
              <span className="col-start-2 row-start-1 text-end font-semibold tabular-nums sm:col-start-auto sm:row-start-auto">{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
