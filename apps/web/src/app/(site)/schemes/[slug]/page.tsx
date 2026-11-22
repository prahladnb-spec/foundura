import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { INDIAN_STATES } from "@foundura/shared";
import { api, ApiError } from "@/lib/api";
import { CATEGORY_LABEL, fmtDate, SCHEME_STATUS_LABEL } from "@/lib/format";
import type { Scheme } from "@/lib/types";

async function load(slug: string): Promise<Scheme> {
  try {
    return await api<Scheme>(`/schemes/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  return { title: s.name, description: s.summary };
}

export default async function SchemePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await load((await params).slug);
  const stateName = INDIAN_STATES.find((x) => x.value === s.state)?.label;
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentService",
          name: s.name,
          description: s.summary,
          provider: { "@type": "GovernmentOrganization", name: s.issuer },
          areaServed: { "@type": s.level === "state" ? "State" : "Country", name: stateName ?? "India" },
          audience: { "@type": "BusinessAudience", name: "Startups in India" },
          url: s.sourceUrl,
        }}
      />
      <p className="text-slate">
        <Link href="/schemes" className="underline">Schemes</Link>
        {stateName ? `, ${stateName}` : ", Central government"}
      </p>
      <h1 className="display mt-2 text-5xl md:text-6xl">{s.name}</h1>
      <p className="mt-2 text-slate">
        {s.issuer}; {CATEGORY_LABEL[s.category] ?? s.category};{" "}
        <span className={s.status === "closed" ? "font-semibold text-marigold-ink" : ""}>{SCHEME_STATUS_LABEL[s.status]}</span>
      </p>
      <p className="mt-6 text-lg">{s.summary}</p>
      {s.statusNote && (
        <p className="mt-4 rounded-md border border-marigold bg-marigold-50 px-4 py-3 text-marigold-ink">{s.statusNote}</p>
      )}

      <h2 className="display mt-10 text-3xl">What you get</h2>
      <ul className="mt-3 list-disc pl-5 space-y-1.5">
        {s.benefits.map((b) => <li key={b}>{b}</li>)}
      </ul>

      <h2 className="display mt-10 text-3xl">How to apply</h2>
      <ol className="mt-3 list-decimal pl-5 space-y-1.5">
        {s.howToApply.map((b) => <li key={b}>{b}</li>)}
      </ol>

      {s.alsoCheck.length > 0 && (
        <>
          <h2 className="display mt-10 text-3xl">Also check before applying</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            {s.alsoCheck.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </>
      )}

      <div className="mt-10 rounded-xl border-2 border-neel-900 p-6">
        <p className="text-lg font-semibold">See if your startup qualifies</p>
        <p className="mt-1 text-neel-700">The Scheme Scan checks this and every other scheme against your answers.</p>
        <Link href="/scan" className="mt-4 inline-block rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">
          Start Scheme Scan
        </Link>
      </div>

      <p className="mt-8 text-[0.92rem] text-slate">
        Official source: <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{s.sourceName}</a>.{" "}
        {s.lastVerifiedAt
          ? `Checked against it on ${fmtDate(s.lastVerifiedAt)}.`
          : "This summary has not yet been checked by our editors; confirm the current rules on the official source."}
      </p>
    </article>
  );
}
