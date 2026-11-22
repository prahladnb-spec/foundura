import Link from "@/components/locale-link";
import { Art, type ArtName } from "@/components/art";
import type { Dict } from "@/i18n";

/** Where each choice leads: its main page and one related page. */
const ROUTES: { art: ArtName; href: string; more: string }[] = [
  { art: "scan", href: "/scan", more: "/schemes" },
  { art: "investors", href: "/investors", more: "/documents/pitch-deck" },
  { art: "events", href: "/events", more: "/startups" },
  { art: "documents", href: "/documents", more: "/learn" },
];

/** "What do you need today?": four doors into the site for a first-time visitor. */
export function NeedChooser({ t }: { t: Dict }) {
  const n = t.home.need;
  return (
    <section aria-labelledby="need-h" className="mx-auto max-w-6xl px-5 pb-16">
      <h2 id="need-h" className="display mb-6 text-4xl">{n.title}</h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {n.options.map((o, i) => {
          const r = ROUTES[i];
          return (
            <li key={r.href} className="need-card relative flex flex-col rounded-xl border-2 border-neel-900 bg-white p-5 shadow-[5px_5px_0_var(--color-neel-900)]">
              <Art name={r.art} className="mx-auto -mt-1 mb-2 h-[120px] w-auto" />
              <h3 className="text-xl font-semibold leading-snug">
                {/* The whole card is the link to the main page; the second link sits above it. */}
                <Link href={r.href} className="no-underline after:absolute after:inset-0 after:rounded-xl hover:underline">{o.t}</Link>
              </h3>
              <p className="mt-1 flex-1 text-[0.95rem] text-neel-700">{o.d}</p>
              <p className="mt-4 font-semibold text-neel-500" aria-hidden="true">{o.cta}</p>
              <Link href={r.more} className="relative z-10 mt-1 self-start text-[0.92rem] text-slate underline">{o.more}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
