import { JsonLd } from "@/components/json-ld";
import Link from "@/components/locale-link";
import { ENTITY_TYPES, INDIAN_STATES, STAGES } from "@foundura/shared";
import { f, getDict, lab } from "@/i18n";
import { INTL_LOCALE, isLang, lp } from "@/i18n/config";
import { HeroFile } from "@/components/hero-file";
import { Stamp } from "@/components/stamp";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange } from "@/lib/format";
import type { ArticleSummary, EventItem, PolicyItem } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const select = "w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const h = t.home;
  const [policy, events, articles] = await Promise.all([
    apiOr<PolicyItem[]>("/policy", []),
    apiOr<EventItem[]>("/events?scope=India", []),
    apiOr<ArticleSummary[]>("/articles", []),
  ]);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Foundura",
            url: SITE,
            logo: `${SITE}/icon.svg`,
            description: "Free help for Indian founders: government schemes, investors, events and guides. Foundura never handles money.",
          },
          { "@context": "https://schema.org", "@type": "WebSite", name: "Foundura", url: `${SITE}${lp(lang, "/") === "/" ? "" : lp(lang, "/")}`, inLanguage: INTL_LOCALE[lang] },
        ]}
      />
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-16 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-end">
        <div>
          <h1 className="display text-[3.4rem] sm:text-[4.6rem] lg:text-[5.4rem] text-neel-950">
            {h.h1}
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg text-neel-700">{h.lead}</p>

          <form action={lp(lang, "/scan")} method="get" className="mt-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">{h.state}</span>
              <select name="state" className={select} defaultValue="">
                <option value="">{t.common.choose}</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{lab(t.labels.state, s.value)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">{h.registeredAs}</span>
              <select name="entityType" className={select} defaultValue="">
                <option value="">{t.common.choose}</option>
                {ENTITY_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{lab(t.labels.entity, s.value)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[0.9rem] font-semibold mb-1">{h.stage}</span>
              <select name="stage" className={select} defaultValue="">
                <option value="">{t.common.choose}</option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{lab(t.labels.stage, s.value)}</option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-3">
              <button className="rounded-md bg-marigold px-6 py-3 text-lg font-semibold text-neel-950 hover:brightness-95">
                {h.start}
              </button>
            </div>
          </form>
        </div>

        <HeroFile>
        <figure aria-label={h.exampleLabel} className="rotate-[1deg] rounded-xl border-2 border-neel-900 bg-white p-6 shadow-[6px_6px_0_var(--color-neel-900)]">
          <figcaption className="text-[0.92rem] text-slate">
            {h.exampleCaption}
          </figcaption>
          <ul className="mt-3 divide-y divide-rule">
            {h.example.map((r, i) => ({ ...r, s: i < 3 ? ("eligible" as const) : ("maybe" as const) })).map((r, i) => (
              <li key={r.n} className="flex items-center gap-4 py-3.5">
                <span className="w-28 shrink-0">
                  <Stamp status={r.s} lang={lang} animate delayMs={300 + i * 120} />
                </span>
                <span>
                  <span lang="en" className="block font-semibold leading-snug">{r.n}</span>
                  <span className="block text-[0.9rem] text-slate">{r.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </figure>
        </HeroFile>
      </section>

      <section className="bg-neel-900 text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">{h.policy}</h2>
            <Link href="/policy" className="text-neel-100 underline">{h.allPolicy}</Link>
          </div>
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {policy.slice(0, 4).map((p) => (
              <li key={p.slug} className="border-t border-neel-500/60 py-4">
                <p className="text-[0.88rem] text-neel-100/80">
                  {fmtDate(p.date, true, lang)}, <span lang="en">{p.country}</span>
                  {p.impact === "High" && <span className="ml-2 rounded bg-marigold px-1.5 py-0.5 text-[0.78rem] font-semibold text-neel-950">{h.highImpact}</span>}
                </p>
                <p lang="en" className="mt-1 text-lg font-semibold leading-snug">{p.headline}</p>
                <p lang="en" className="mt-1 text-[0.95rem] text-neel-100/85">{p.takeaway}</p>
              </li>
            ))}
            {policy.length === 0 && <li className="py-4 text-neel-100/80">{h.policyEmpty}</li>}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">{h.comingUp}</h2>
            <Link href="/events" className="text-neel-500 underline">{h.allEvents}</Link>
          </div>
          <ul className="mt-5 border-t-2 border-neel-900">
            {events.slice(0, 6).map((e) => (
              <li key={e.slug} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-rule py-3.5">
                <span className="font-semibold text-neel-700">
                  {e.startDate ? fmtRange(e.startDate, e.endDate, lang) : f(h.deadline, { date: fmtDate(e.deadline, true, lang) })}
                </span>
                <span>
                  <span lang="en" className="block font-semibold leading-snug">{e.name}</span>
                  <span lang="en" className="block text-[0.9rem] text-slate">{[e.city, e.type].filter(Boolean).join(", ")}</span>
                </span>
              </li>
            ))}
            {events.length === 0 && <li className="py-4 text-slate">{h.eventsEmpty}</li>}
          </ul>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display text-4xl">{h.readToday}</h2>
            <Link href="/learn" className="text-neel-500 underline">{h.allGuides}</Link>
          </div>
          <ul className="mt-5 space-y-6">
            {articles.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <p className="text-[0.88rem] text-slate"><span lang="en">{a.theme}</span>, {f(t.common.minRead, { n: a.readMinutes })}</p>
                <Link href={`/learn/${a.slug}`} lang="en" className="text-xl font-semibold leading-snug hover:underline">
                  {a.title}
                </Link>
                <p lang="en" className="mt-1 text-neel-700">{a.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
