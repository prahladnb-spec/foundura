"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/schemes", label: "Schemes" },
  { href: "/admin/startups", label: "Startups" },
  { href: "/admin/investors", label: "Investors" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/alerts", label: "Scheme alerts" },
  { href: "/admin/imports", label: "Imports" },
  { href: "/admin/usage", label: "Usage" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1 border-b border-rule">
      {LINKS.map((l) => {
        const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px border-b-[3px] px-3 py-2.5 font-semibold no-underline ${on ? "border-marigold text-neel-950" : "border-transparent text-neel-700 hover:text-neel-950"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
