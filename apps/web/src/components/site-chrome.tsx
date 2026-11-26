import { awaitingReview } from "@/i18n/reviews";
import { legalDetails } from "@/lib/legal";
import Link from "@/components/locale-link";
import { cookies } from "next/headers";
import { type Dict, getDict } from "@/i18n";
import { LANG_INFO, type Lang } from "@/i18n/config";
import { BookOpen, CalendarDays, ClipboardCheck, FolderOpen, Handshake, Landmark, Newspaper, Store, Search } from "lucide-react";
import { Icon } from "./icons";
import { LangSwitch } from "./lang-switch";
import { NewsletterForm } from "./newsletter-form";

const nav = (t: Dict) => [
  { href: "/scan", label: t.chrome.nav.scan, icon: ClipboardCheck },
  { href: "/schemes", label: t.chrome.nav.schemes, icon: Landmark },
  { href: "/startups", label: t.chrome.nav.startups, icon: Store },
  { href: "/investors", label: t.chrome.nav.investors, icon: Handshake },
  { href: "/events", label: t.chrome.nav.events, icon: CalendarDays },
  { href: "/policy", label: t.chrome.nav.policy, icon: Newspaper },
  { href: "/learn", label: t.chrome.nav.learn, icon: BookOpen },
  { href: "/documents", label: t.chrome.nav.documents, icon: FolderOpen },
];

// The logo files (public/brand) are 3602 × 1000; the link carries the accessible name.
const LOGO_RATIO = 3602 / 1000;

function Wordmark({ label }: { label: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center no-underline" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG; next/image adds nothing here */}
      <img src="/brand/foundura-logo.svg" alt="" width={Math.round(36 * LOGO_RATIO)} height={36} className="h-8 w-auto sm:h-9" />
    </Link>
  );
}

export async function SiteHeader({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const NAV = nav(t);
  const wide = LANG_INFO[lang].wideNav;
  const support = legalDetails().supportEmail ?? "support@foundura.org";
  const signedIn = Boolean((await cookies()).get("fd_session"));
  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-6">
        <Wordmark label={t.chrome.homeLabel} />
        <nav aria-label="Main" className={`hidden ${wide ? "2xl:flex" : "xl:flex"} items-center gap-5 whitespace-nowrap text-[0.95rem]`}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-neel-700 hover:text-neel-950 no-underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-4">
          <Link href="/search" className="inline-flex items-center gap-1.5 text-[0.95rem] font-semibold text-neel-700 hover:text-neel-950 no-underline">
            <Icon icon={Search} className="h-[1.1rem] w-[1.1rem]" />
            <span className="sr-only sm:not-sr-only">{t.chrome.search}</span>
          </Link>
          <LangSwitch className="text-[0.95rem] font-semibold text-neel-700 hover:text-neel-950 no-underline" />
          <Link
            href={signedIn ? "/dashboard" : "/signin"}
            className="inline-block whitespace-nowrap rounded-md border-2 border-neel-900 px-3.5 py-1.5 text-[0.95rem] font-semibold text-neel-900 hover:bg-neel-900 hover:text-paper no-underline"
          >
            {signedIn ? t.chrome.myStartup : t.chrome.signIn}
          </Link>
        </div>
      </div>
      {awaitingReview(lang) && (
        <p className="border-t border-rule bg-marigold-50 px-5 py-1.5 text-center text-[0.85rem] text-neel-700">
          {t.chrome.unreviewed.split("{email}")[0]}
          <a href={`mailto:${support}`} className="underline" dir="ltr">{support}</a>
          {t.chrome.unreviewed.split("{email}")[1]}
        </p>
      )}
      <nav aria-label="Main mobile" className={`${wide ? "2xl:hidden" : "xl:hidden"} border-t border-rule overflow-x-auto`}>
        <div className="flex gap-5 px-5 py-2 text-[0.92rem] whitespace-nowrap">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="inline-flex items-center gap-1.5 text-neel-700 no-underline">
              <Icon icon={n.icon} className="h-4 w-4 text-neel-500" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const ft = t.chrome.footer;
  return (
    <footer className="mt-20 bg-neel-900 text-neel-100">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr] text-[0.95rem]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG */}
          <img src="/brand/foundura-logo-white.svg" alt="Foundura" width={Math.round(44 * LOGO_RATIO)} height={44} className="h-11 w-auto" loading="lazy" />
          <p className="mt-3 text-paper font-semibold">{t.chrome.tagline}</p>
          <p className="mt-2 max-w-md text-neel-100/80">{t.chrome.footerBlurb}</p>
          <NewsletterForm />
        </div>
        <ul className="space-y-1.5">
          <li><Link href="/scan" className="hover:text-paper">{ft.scan}</Link></li>
          <li><Link href="/schemes" className="hover:text-paper">{ft.allSchemes}</Link></li>
          <li><Link href="/events" className="hover:text-paper">{ft.events}</Link></li>
          <li><Link href="/policy" className="hover:text-paper">{ft.policy}</Link></li>
          <li><Link href="/perks" className="hover:text-paper">{ft.perks}</Link></li>
          <li><Link href="/investor-update" className="hover:text-paper">{ft.investorUpdate}</Link></li>
          <li className="pt-3"><Link href="/mentors" className="hover:text-paper">{ft.mentors}</Link></li>
          <li><Link href="/coworking" className="hover:text-paper">{ft.coworking}</Link></li>
          <li><Link href="/students" className="hover:text-paper">{ft.students}</Link></li>
          <li><Link href="/women" className="hover:text-paper">{ft.women}</Link></li>
          <li><Link href="/selling" className="hover:text-paper">{ft.selling}</Link></li>
          <li className="pt-3"><Link href="/about" className="hover:text-paper">{ft.about}</Link></li>
          <li><Link href="/contact" className="hover:text-paper">{ft.contact}</Link></li>
          <li className="pt-3"><Link href="/numbers" className="hover:text-paper">{ft.numbers}</Link></li>
          <li><Link href="/data" className="hover:text-paper">{ft.data}</Link></li>
        </ul>
        <ul className="space-y-1.5">
          <li><Link href="/learn" className="hover:text-paper">{ft.guides}</Link></li>
          <li><Link href="/documents" className="hover:text-paper">{ft.documents}</Link></li>
          <li><Link href="/glossary" className="hover:text-paper">{ft.glossary}</Link></li>
          <li><Link href="/startups" className="hover:text-paper">{ft.startups}</Link></li>
          <li><Link href="/investors" className="hover:text-paper">{ft.investors}</Link></li>
          <li><Link href="/funding" className="hover:text-paper">{ft.funding}</Link></li>
          <li><Link href="/states" className="hover:text-paper">{ft.states}</Link></li>
          <li><Link href="/cities" className="hover:text-paper">{ft.cities}</Link></li>
          <li><Link href="/basics" className="hover:text-paper">{ft.basics}</Link></li>
          <li><Link href="/sectors/medtech" className="hover:text-paper">{ft.medtech}</Link></li>
          <li><Link href="/sectors/software" className="hover:text-paper">{ft.software}</Link></li>
          <li><Link href="/partners" className="hover:text-paper">{ft.partners}</Link></li>
          <li><Link href="/privacy" className="hover:text-paper">{ft.privacy}</Link></li>
          <li><Link href="/terms" className="hover:text-paper">{ft.terms}</Link></li>
        </ul>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-[0.85rem] text-neel-100/60">
        {t.chrome.footerNote}
      </p>
    </footer>
  );
}
