import { pageMetadata } from "@/seo";
import { CategoryStamp } from "@/components/icons";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { MedtechFinder } from "@/components/medtech-finder";
import { f, getDict, lab } from "@/i18n";
import { contentLang, isLang, LANG_INFO } from "@/i18n/config";
import { apiOr } from "@/lib/api";
import { fmtDate, fmtRange } from "@/lib/format";
import { chequeRange, investorTypeLabel } from "@/lib/labels";
import type { EventItem, InvestorPublic, Scheme } from "@/lib/types";
import {
  CHECKED_ON,
  hubText,
  MEDTECH_SCHEMES,
  SOURCES,
} from "@/sectors/medtech";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("medtech", isLang(lang) ? lang : "en");
}

const HEALTH = /med|health|bio|diagnos|hospital|pharma/i;

export default async function MedtechHub({ params }: { params: Params }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  // The guide is written in English and Hindi; other languages read the English, marked as such.
  const t = hubText[contentLang(lang)];
  const guideLang = contentLang(lang) === lang ? undefined : "en";
  const d = getDict(lang);
  const nameCond = lang === "en" ? undefined : "en";

  const [schemes, investors, events] = await Promise.all([
    apiOr<Scheme[]>(`/schemes?lang=${lang}`, []),
    apiOr<InvestorPublic[]>("/investors?sector=medtech", [], 0),
    apiOr<EventItem[]>("/events", []),
  ]);
  const bySlug = new Map(schemes.map((s) => [s.slug, s]));
  const medSchemes = MEDTECH_SCHEMES.map((slug) => bySlug.get(slug)).filter(
    (s): s is Scheme => Boolean(s),
  );
  const healthEvents = events
    .filter((e) => HEALTH.test(`${e.name} ${e.bestFor ?? ""} ${e.notes ?? ""}`))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      {guideLang && (
        <p className="mb-4 rounded-md bg-neel-50 px-4 py-2.5 text-[0.95rem] text-neel-700">
          {d.common.pageInEnglish}
        </p>
      )}
      <div lang={guideLang}>
        <p className="text-slate">{t.breadcrumb}</p>
        <h1 className="display mt-2 max-w-[18ch] text-6xl md:text-7xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-neel-700">{t.lead}</p>

        <section
          aria-labelledby="finder-h"
          className="mt-12 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8"
        >
          <h2 id="finder-h" className="display text-4xl">
            {t.finder.title}
          </h2>
          <p className="mt-1 mb-6 text-neel-700">{t.finder.lead}</p>
          <MedtechFinder />
        </section>

        <section aria-labelledby="money-h" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="money-h" className="display text-4xl">
              {t.money.title}
            </h2>
            <Link
              href="/scan?sector=medtech"
              className="rounded-md bg-marigold px-4 py-2 font-semibold text-neel-950 no-underline"
            >
              {t.money.check}
            </Link>
          </div>
          <p className="mt-1 max-w-[65ch] text-neel-700">{t.money.lead}</p>
          <ul className="mt-5 border-t-2 border-neel-900">
            {medSchemes.map((s) => (
              <li
                key={s.slug}
                className="grid gap-1 border-b border-rule py-4 md:grid-cols-[1fr_12rem]"
              >
                <div>
                  <Link
                    href={`/schemes/${s.slug}`}
                    lang={s.contentLang !== lang ? "en" : undefined}
                    className="text-lg font-semibold hover:underline"
                  >
                    {s.name}
                  </Link>
                  <p
                    lang={s.contentLang !== lang ? "en" : undefined}
                    className="max-w-[70ch] text-neel-700"
                  >
                    {s.summary}
                  </p>
                </div>
                <p className="flex items-center gap-3 text-[0.92rem] text-slate md:flex-col md:items-end md:gap-1">
                  <CategoryStamp
                    category={s.category}
                    label={String(lab(d.labels.category, s.category))}
                  />
                  <span
                    lang={guideLang && LANG_INFO[lang].tag}
                    className={
                      s.status === "closed"
                        ? "font-semibold text-marigold-ink"
                        : s.status === "open" || s.status === "rolling"
                          ? "font-semibold text-leaf"
                          : ""
                    }
                  >
                    {lab(d.labels.schemeStatus, s.status)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 grid gap-14 lg:grid-cols-2">
          <section aria-labelledby="help-h">
            <h2 id="help-h" className="display text-4xl">
              {t.help.title}
            </h2>
            <ul className="mt-5 space-y-5">
              {t.help.items.map((h) => (
                <li key={h.name}>
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold"
                  >
                    {h.name}
                  </a>
                  <p className="text-neel-700">{h.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-14">
            <section aria-labelledby="inv-h">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 id="inv-h" className="display text-4xl">
                  {t.investors.title}
                </h2>
                <Link
                  href="/investors?sector=medtech"
                  className="text-neel-500 underline"
                >
                  {t.investors.browse}
                </Link>
              </div>
              {investors.length === 0 ? (
                <p className="mt-3 text-slate">{t.investors.empty}</p>
              ) : (
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {investors.slice(0, 5).map((i) => (
                    <li key={i.id} className="py-3">
                      <Link
                        href={`/investors/${i.slug}`}
                        lang={nameCond}
                        className="font-semibold"
                      >
                        {i.firm ?? i.name}
                      </Link>
                      <p className="text-[0.93rem] text-slate">
                        {investorTypeLabel(i.type, lang)};{" "}
                        {chequeRange(
                          i.chequeMinInrLakh,
                          i.chequeMaxInrLakh,
                          lang,
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="ev-h">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 id="ev-h" className="display text-4xl">
                  {t.events.title}
                </h2>
                <Link href="/events" className="text-neel-500 underline">
                  {t.events.all}
                </Link>
              </div>
              {healthEvents.length === 0 ? (
                <p className="mt-3 text-slate">{t.events.empty}</p>
              ) : (
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {healthEvents.map((e) => (
                    <li
                      key={e.slug}
                      className="grid grid-cols-[8rem_1fr] gap-3 py-3"
                    >
                      <span className="font-semibold text-neel-700">
                        {e.startDate
                          ? fmtRange(e.startDate, e.endDate, lang)
                          : fmtDate(e.deadline, true, lang)}
                      </span>
                      <span lang={nameCond}>
                        <span className="block font-semibold leading-snug">
                          {e.name}
                        </span>
                        <span className="block text-[0.9rem] text-slate">
                          {[e.city, e.type].filter(Boolean).join(", ")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <section
          aria-labelledby="src-h"
          className="mt-16 border-t border-rule pt-6 text-[0.93rem]"
        >
          <p className="max-w-[75ch] text-slate">
            {f(t.checked, { date: fmtDate(CHECKED_ON, true, lang) })}
          </p>
          <h2 id="src-h" className="mt-4 font-semibold">
            {t.sources}
          </h2>
          <ul lang={nameCond} className="mt-2 space-y-1">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
