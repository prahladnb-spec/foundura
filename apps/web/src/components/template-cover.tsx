import { docText } from "@/documents/text";
import type { Lang } from "@/i18n/config";
import Link from "@/components/locale-link";
import { KindIcon } from "@/components/icons";
import { FORMAT } from "@/components/template-preview";
import { coverSrc, docBySlug } from "@/documents";

/** A template's drawn cover. Decorative: the title beside or under it says what it is. */
export function Cover({ slug, className = "", eager = false }: { slug: string; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG
    <img src={coverSrc(slug)} alt="" width={320} height={240} loading={eager ? "eager" : "lazy"} decoding="async" className={`rounded-lg border-2 border-neel-900 ${className}`} />
  );
}

/** The templates page's shelf: each covered template as a card. */
export function CoverShelf({ slugs, lang, title, lead }: { slugs: readonly string[]; lang: Lang; title: string; lead: string }) {
  return (
    <section aria-labelledby="essentials-h" className="mt-10">
      <h2 id="essentials-h" className="display text-4xl">{title}</h2>
      <p className="mt-1 text-slate">{lead}</p>
      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
        {slugs.map((slug) => {
          const doc = docBySlug(slug)!;
          return (
            <li key={slug}>
              <Link href={`/documents/${slug}`} className="cover-card group block no-underline">
                <Cover slug={slug} className="w-full shadow-[4px_4px_0_var(--color-neel-900)] transition-transform group-hover:-translate-y-1" />
                <span className="mt-2.5 block font-semibold leading-snug text-neel-900 group-hover:underline">{docText(doc, lang).title}</span>
                <span lang="en" className="mt-0.5 inline-flex items-center gap-1 text-[0.85rem] text-slate">
                  <KindIcon kind={doc.template.kind} className="h-3.5 w-3.5" />
                  {FORMAT[doc.template.kind]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
