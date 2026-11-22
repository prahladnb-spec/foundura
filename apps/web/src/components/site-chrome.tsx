import Link from "next/link";
import { cookies } from "next/headers";

const NAV = [
  { href: "/scan", label: "Scheme Scan" },
  { href: "/schemes", label: "Schemes" },
  { href: "/events", label: "Events" },
  { href: "/policy", label: "Policy news" },
  { href: "/learn", label: "Learn" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 text-neel-900 no-underline" aria-label="Foundura home">
      {/* Mark: a sprouting seed inside a stamp ring */}
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 22V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 14c0-3.5 2.5-5.5 6-5.5 0 3.5-2.5 5.5-6 5.5Z" fill="var(--color-marigold)" />
        <path d="M15 16c0-2.8-2-4.5-5-4.5 0 2.8 2 4.5 5 4.5Z" fill="currentColor" />
      </svg>
      <span className="display text-[1.7rem] leading-none pt-1">Foundura</span>
    </Link>
  );
}

export async function SiteHeader() {
  const signedIn = Boolean((await cookies()).get("fd_session"));
  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden md:flex items-center gap-5 text-[0.95rem]">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-neel-700 hover:text-neel-950 no-underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Link
            href={signedIn ? "/dashboard" : "/signin"}
            className="inline-block rounded-md border-2 border-neel-900 px-3.5 py-1.5 text-[0.95rem] font-semibold text-neel-900 hover:bg-neel-900 hover:text-paper no-underline"
          >
            {signedIn ? "My startup" : "Sign in"}
          </Link>
        </div>
      </div>
      <nav aria-label="Main mobile" className="md:hidden border-t border-rule overflow-x-auto">
        <div className="flex gap-5 px-5 py-2 text-[0.92rem] whitespace-nowrap">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-neel-700 no-underline">
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-neel-900 text-neel-100">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr] text-[0.95rem]">
        <div>
          <p className="display text-3xl text-paper">Foundura</p>
          <p className="mt-2 max-w-md text-neel-100/80">
            Free help for Indian founders: which schemes you qualify for, who might invest, and where to show up. We
            never handle your money.
          </p>
        </div>
        <ul className="space-y-1.5">
          <li><Link href="/scan" className="hover:text-paper">Scheme Scan</Link></li>
          <li><Link href="/schemes" className="hover:text-paper">All schemes</Link></li>
          <li><Link href="/events" className="hover:text-paper">Events</Link></li>
          <li><Link href="/policy" className="hover:text-paper">Policy news</Link></li>
        </ul>
        <ul className="space-y-1.5">
          <li><Link href="/learn" className="hover:text-paper">Founder guides</Link></li>
          <li><Link href="/privacy" className="hover:text-paper">Privacy and your data</Link></li>
        </ul>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-[0.85rem] text-neel-100/60">
        Scheme details are summaries. Always confirm on the official source linked on each scheme before you apply.
      </p>
    </footer>
  );
}
