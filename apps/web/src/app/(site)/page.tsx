import Link from "next/link";
import { ENTITY_TYPES, INDIAN_STATES, STAGES } from "@foundura/shared";
import { Stamp } from "@/components/stamp";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange } from "@/lib/format";
import type { ArticleSummary, EventItem, PolicyItem } from "@/lib/types";

const select = "w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";

export default async function Home() {
  const [policy, events, articles] = await Promise.all([
    apiOr<PolicyItem[]>("/policy", []),
    apiOr<EventItem[]>("/events?scope=India", []),
    apiOr<ArticleSummary[]>("/articles", []),
  ]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-16 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-end">
        <div>
          <h1 className="display text-[3.4rem] sm:text-[4.6rem] lg:text-[5.4rem] text-neel-950">
            Which government schemes does your startup qualify for?
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg text-neel-700">
            Answer a few questions. Foundura checks central and state schemes and shows exactly which conditions you
            meet. Free, and nothing you enter is saved.
          </p>

          <form action="/scan" method="get" className="mt-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">State or UT</span>
              <select name="state" className={select} defaultValue="">
                <option value="">Choose…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">Registered as</span>
              <select name="entityType" className={select} defaultValue="">
                <option value="">Choose…</option>
                {ENTITY_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">Stage</span>
              <select name="stage" className={select} defaultValue="">
                <option value="">Choose…</option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-3">
              <button className="rounded-md bg-marigold px-6 py-3 text-lg font-semibold text-neel-950 hover:brightness-95">
                Start Scheme Scan
              </button>
            </div>
          </form>
        </div>

        <figure aria-label="Example Scheme Scan result" className="rounded-xl border-2 border-neel-900 bg-white p-6 shadow-[6px_6px_0_var(--color-neel-900)]">
          <figcaption className="text-[0.92rem] text-slate">
            Example result for a 1-year-old medtech company in Karnataka
          </figcaption>
          <ul className="mt-3 divide-y divide-rule">
            {[
              { s: "eligible" as const, n: "DPIIT Startup Recognition", d: "All 3 conditions met" },
              { s: "eligible" as const, n: "BIRAC Biotechnology Ignition Grant", d: "Medtech at proof-of-concept stage" },
              { s: "eligible" as const, n: "Karnataka Startup Policy 2025–30", d: "Based in Karnataka" },
              { s: "maybe" as const, n: "Startup India Seed Fund", d: "Tell us past government support to confirm" },
            ].map((r, i) => (
              <li key={r.n} className="flex items-center gap-4 py-3.5">
                <span className="w-28 shrink-0">
                  <Stamp status={r.s} animate delayMs={300 + i * 120} />
                </span>
                <span>
                  <span className="block font-semibold leading-snug">{r.n}</span>
                  <span className="block text-[0.9rem] text-slate">{r.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </figure>
      </section>

      <section className="bg-neel-900 text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">Policy news</h2>
            <Link href="/policy" className="text-neel-100 underline">All policy news</Link>
          </div>
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {policy.slice(0, 4).map((p) => (
              <li key={p.slug} className="border-t border-neel-500/60 py-4">
                <p className="text-[0.88rem] text-neel-100/80">
                  {fmtDate(p.date)}, {p.country}
                  {p.impact === "High" && <span className="ml-2 rounded bg-marigold px-1.5 py-0.5 text-[0.78rem] font-semibold text-neel-950">High impact</span>}
                </p>
                <p className="mt-1 text-lg font-semibold leading-snug">{p.headline}</p>
                <p className="mt-1 text-[0.95rem] text-neel-100/85">{p.takeaway}</p>
              </li>
            ))}
            {policy.length === 0 && <li className="py-4 text-neel-100/80">Policy news will appear here.</li>}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">Coming up in India</h2>
            <Link href="/events" className="text-neel-500 underline">All events</Link>
          </div>
          <ul className="mt-5 border-t-2 border-neel-900">
            {events.slice(0, 6).map((e) => (
              <li key={e.slug} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-rule py-3.5">
                <span className="font-semibold text-neel-700">
                  {e.startDate ? fmtRange(e.startDate, e.endDate) : `Deadline ${fmtDate(e.deadline)}`}
                </span>
                <span>
                  <span className="block font-semibold leading-snug">{e.name}</span>
                  <span className="block text-[0.9rem] text-slate">{[e.city, e.type].filter(Boolean).join(", ")}</span>
                </span>
              </li>
            ))}
            {events.length === 0 && <li className="py-4 text-slate">Upcoming events will appear here.</li>}
          </ul>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">Read today</h2>
            <Link href="/learn" className="text-neel-500 underline">All guides</Link>
          </div>
          <ul className="mt-5 space-y-6">
            {articles.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <p className="text-[0.88rem] text-slate">{a.theme}, {a.readMinutes} min read</p>
                <Link href={`/learn/${a.slug}`} className="text-xl font-semibold leading-snug hover:underline">
                  {a.title}
                </Link>
                <p className="mt-1 text-neel-700">{a.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
