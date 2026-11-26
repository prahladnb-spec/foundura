/**
 * The site's illustrations: hand-drawn SVGs in public/art, in the "paperwork made friendly" style
 * (manila files, red tape, rubber stamps, ledgers, chai). They contain no words, so they suit both
 * languages, and they're decorative: alt="" keeps them out of screen readers.
 */
export type ArtName =
  | "scan"
  | "schemes"
  | "showcase"
  | "investors"
  | "events"
  | "documents"
  | "learn"
  | "policy"
  | "glossary"
  | "letter"
  | "perks"
  | "empty";

export function Art({ name, className = "", eager = false }: { name: ArtName; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; next/image adds nothing here
    <img
      src={`/art/${name}.svg`}
      alt=""
      width={360}
      height={280}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}

/** A page's title and introduction, with its illustration alongside on wider screens. */
export function PageIntro({ art, children }: { art: ArtName; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-x-10 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">{children}</div>
      <Art name={art} eager className="art-settle hidden w-[260px] md:block lg:w-[320px]" />
    </div>
  );
}
