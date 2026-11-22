import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/locale-link";
import { getDict } from "@/i18n";
import { isLang, type Lang } from "@/i18n/config";
import { api, ApiError } from "@/lib/api";
import { userTextLang } from "@/lib/format";
import { lookingForLabel, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import { legalDetails } from "@/lib/legal";
import type { StartupPublic } from "@/lib/types";

type Params = Promise<{ slug: string; lang: string }>;

async function load(slug: string): Promise<StartupPublic> {
  try {
    // Not cached: a founder who switches their profile off, or a listing an editor hides, must go at once.
    return await api<StartupPublic>(`/startups/${encodeURIComponent(slug)}`, { revalidate: 0 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

const langOf = (l: string): Lang => (isLang(l) ? l : "en");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params;
  const s = await load(p.slug);
  const t = getDict(langOf(p.lang));
  return { title: s.name, description: s.oneLiner ?? t.startups.metaDescription };
}

/** Links founders add go out with nofollow/ugc, and never pass the visitor's page address on. */
const OUT = "nofollow ugc noopener noreferrer";

export default async function StartupPage({ params }: { params: Params }) {
  const p = await params;
  const lang = langOf(p.lang);
  const t = getDict(lang);
  const d = t.startup;
  const s = await load(p.slug);
  const legal = legalDetails();
  const reportTo = legal.supportEmail ?? legal.grievanceEmail;
  const [noteBefore, noteAfter] = d.investorsNote.split("{link}");

  const rows: [string, string][] = [];
  if (s.sectors.length) rows.push([d.sectors, s.sectors.map((x) => sectorLabel(x, lang)).join(", ")]);
  if (s.stage) rows.push([d.stage, stageLabel(s.stage, lang)]);
  if (s.state) rows.push([d.basedIn, stateLabel(s.state, lang)]);
  if (s.foundedYear) rows.push([d.founded, String(s.foundedYear)]);
  const badges = [s.dpiitRecognised && d.dpiit, s.isDeepTech && d.deepTech].filter(Boolean) as string[];

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: s.name,
          ...(s.oneLiner ? { description: s.oneLiner } : {}),
          ...(s.website ? { url: s.website } : {}),
          ...(s.foundedYear ? { foundingDate: String(s.foundedYear) } : {}),
          address: { "@type": "PostalAddress", addressCountry: "IN", ...(s.state ? { addressRegion: stateLabel(s.state, "en") } : {}) },
        }}
      />
      <p className="text-slate">
        <Link href="/startups" className="underline">{d.all}</Link>
      </p>
      <h1 lang={userTextLang(s.name, lang)} className="display mt-2 text-5xl md:text-6xl">{s.name}</h1>
      {s.oneLiner && <p lang={userTextLang(s.oneLiner, lang)} className="mt-3 max-w-[60ch] text-xl text-neel-700">{s.oneLiner}</p>}
      {badges.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded border border-leaf px-2 py-0.5 text-[0.88rem] font-semibold text-leaf">{b}</span>
          ))}
        </p>
      )}

      {(s.productUrl || s.website) && (
        <p className="mt-6 flex flex-wrap gap-3">
          {s.productUrl && (
            <a href={s.productUrl} target="_blank" rel={OUT} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper no-underline">
              {d.product}
            </a>
          )}
          {s.website && (
            <a href={s.website} target="_blank" rel={OUT} className="rounded-md border-2 border-neel-900 px-5 py-2 font-semibold no-underline">
              {d.website}
            </a>
          )}
        </p>
      )}

      {s.lookingFor.length > 0 && (
        <section aria-labelledby="looking-h" className="mt-8">
          <h2 id="looking-h" className="text-lg font-semibold">{d.lookingFor}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {s.lookingFor.map((x) => (
              <li key={x} className="rounded-full border border-marigold bg-marigold-50 px-3 py-1 text-marigold-ink">{lookingForLabel(x, lang)}</li>
            ))}
          </ul>
        </section>
      )}

      {s.description && (
        <section aria-labelledby="about-h" className="mt-8">
          <h2 id="about-h" className="text-lg font-semibold">{d.about}</h2>
          <div lang={userTextLang(s.description, lang)} className="mt-2 max-w-[65ch] space-y-3 text-lg">
            {s.description.split(/\n{2,}/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <dl className="mt-8 border-t-2 border-neel-900">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-rule py-3">
              <dt className="font-semibold">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-8 max-w-[65ch] text-neel-700">
        {noteBefore}
        <Link href="/dashboard/investor" className="text-neel-500 underline">{d.investorsLink}</Link>
        {noteAfter}
      </p>
      <p className="mt-4 text-[0.93rem] text-slate">
        {d.listedNote}{" "}
        {reportTo ? (
          <a href={`mailto:${reportTo}?subject=${encodeURIComponent(`Report: /startups/${s.slug}`)}`} className="underline">{d.report}</a>
        ) : (
          <Link href="/terms" className="underline">{d.report}</Link>
        )}
      </p>
    </article>
  );
}
