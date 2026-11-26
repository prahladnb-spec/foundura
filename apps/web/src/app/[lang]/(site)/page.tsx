import { NeedChooser } from "@/components/need-chooser";
import type { Metadata } from "next";
import { pageMetadata } from "@/seo";
import { BookOpen, CalendarDays, Globe2, GraduationCap, HandCoins, MapPin, Map as MapIcon, Newspaper, Store, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/icons";
import { Steps } from "@/components/infographics/steps";
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

/** Where each "Building elsewhere" link leads, in the order of `home.world.links`. */
const WORLD: { href: string; icon: LucideIcon }[] = [
  { href: "/events", icon: CalendarDays },
  { href: "/startups", icon: Store },
  { href: "/investors", icon: HandCoins },
  { href: "/basics", icon: GraduationCap },
  { href: "/states", icon: MapIcon },
];

const select = "w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("home", isLang(lang) ? lang : "en");
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  const h = t.home;
  const [policy, events, articles] = await Promise.all([
    apiOr<PolicyItem[]>("/policy", []),
    apiOr<EventItem[]>("/events", []),
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
            description: "Free help for startup founders: government schemes in India, startup events worldwide, investors, a startup showcase, guides and templates. Foundura never handles money.",
          },
          { "@context": "https://schema.org", "@type": "WebSite", name: "Foundura", url: `${SITE}${lp(lang, "/") === "/" ? "" : lp(lang, "/")}`, inLanguage: INTL_LOCALE[lang] },
        ]}
      />
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-16">
        <h1 className="display max-w-[22ch] text-[2.9rem] sm:text-[4.4rem] lg:text-[5rem] text-neel-950">
          {h.h1}
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-neel-700">{h.lead}</p>

        {/* Two ways in: Indian founders go straight to the Scheme Scan, everyone else to what works anywhere. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="india-h" className="flex flex-col rounded-xl border-2 border-neel-900 bg-white p-6 shadow-[6px_6px_0_var(--color-neel-900)]">
            <h2 id="india-h" className="display flex items-center gap-3 text-3xl"><Icon icon={MapPin} className="h-7 w-7 text-tape" />{h.india.title}</h2>
            <p className="mt-2 text-neel-700">{h.india.d}</p>
              <form action={lp(lang, "/scan")} method="get" className="mt-5 mb-6 grid items-end gap-3 sm:grid-cols-3">
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
            {/* The three steps of the scan, in short; the full version is further down the page. */}
            <ol className="mt-auto grid gap-3 border-t border-rule pt-5 sm:grid-cols-3">
              {h.how.steps.map((st, i) => (
                <li key={st.t} className="flex gap-3 text-[0.95rem] font-semibold leading-snug sm:block">
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marigold-50 font-bold text-marigold-ink sm:mb-2">{i + 1}</span>
                  {st.t}
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="world-h" className="rounded-xl border-2 border-neel-900 bg-neel-50 p-6 shadow-[6px_6px_0_var(--color-neel-900)]">
            <h2 id="world-h" className="display flex items-center gap-3 text-3xl"><Icon icon={Globe2} className="h-7 w-7 text-neel-500" />{h.world.title}</h2>
            <p className="mt-2 text-neel-700">{h.world.d}</p>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {h.world.links.map((l, i) => (
                <li key={WORLD[i].href}>
                  <Link href={WORLD[i].href} className="group flex items-start gap-3 py-3 no-underline">
                    <Icon icon={WORLD[i].icon} className="mt-1 h-5 w-5 shrink-0 text-neel-500" />
                    <span>
                      <span className="block font-semibold group-hover:underline">{l.t}</span>
                      <span className="block text-[0.92rem] text-slate">{l.d}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <NeedChooser t={t} />

      <section aria-labelledby="how-h" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center max-sm:overflow-x-clip">
          <div>
            <h2 id="how-h" className="display text-4xl">{h.how.title}</h2>
            <p className="mt-2 text-lg text-neel-700">{h.scanFor}</p>
            <Link href="/scan" className="mt-5 inline-block rounded-md border-2 border-neel-900 px-5 py-2 font-semibold no-underline hover:bg-neel-50">{h.start}</Link>
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
                    <Stamp status={r.s} label={t.stamp[r.s]} animate delayMs={300 + i * 120} />
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
        </div>
        <div className="mt-12">
          <Steps cols={3} label={h.how.title} steps={h.how.steps} />
        </div>
      </section>

      <section className="bg-neel-900 text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="display flex items-center gap-3 text-4xl"><Icon icon={Newspaper} className="h-8 w-8 text-marigold" />{h.policy}</h2>
            <Link href="/policy" className="text-neel-100 underline">{h.allPolicy}</Link>
          </div>
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {policy.slice(0, 4).map((p) => (
              <li key={p.slug} className="border-t border-neel-500/60 py-4">
                <p className="text-[0.88rem] text-neel-100/80">
                  {fmtDate(p.date, true, lang)}, <span lang="en">{p.country}</span>
                  {p.impact === "High" && <span className="ms-2 rounded bg-marigold px-1.5 py-0.5 text-[0.78rem] font-semibold text-neel-950">{h.highImpact}</span>}
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="display flex items-center gap-3 text-4xl"><Icon icon={CalendarDays} className="h-8 w-8 text-tape" />{h.comingUp}</h2>
            <span className="flex gap-4">
              <Link href="/events?region=India" className="text-neel-500 underline">{h.indiaEvents}</Link>
              <Link href="/events" className="text-neel-500 underline">{h.allEvents}</Link>
            </span>
          </div>
          <ul className="mt-5 border-t-2 border-neel-900">
            {events.slice(0, 6).map((e) => (
              <li key={e.slug} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-rule py-3.5">
                <span className="font-semibold text-neel-700">
                  {e.startDate ? fmtRange(e.startDate, e.endDate, lang) : f(h.deadline, { date: fmtDate(e.deadline, true, lang) })}
                </span>
                <span>
                  <span lang="en" className="block font-semibold leading-snug">{e.name}</span>
                  <span lang="en" className="block text-[0.9rem] text-slate">{[e.city, e.country, e.type].filter(Boolean).join(", ")}</span>
                </span>
              </li>
            ))}
            {events.length === 0 && <li className="py-4 text-slate">{h.eventsEmpty}</li>}
          </ul>
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="display flex items-center gap-3 text-4xl"><Icon icon={BookOpen} className="h-8 w-8 text-neel-500" />{h.readToday}</h2>
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
