import { type NextRequest, NextResponse } from "next/server";

/**
 * Language routing. English keeps today's URLs (served internally from /en/...), Hindi lives
 * under /hi/... The editor console is English-only.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // One address per page: /en/... redirects to the plain URL.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/hi" || pathname.startsWith("/hi/")) {
    if (/^\/hi\/admin(\/|$)/.test(pathname)) {
      url.pathname = pathname.slice(3);
      return NextResponse.redirect(url, 307);
    }
    return NextResponse.next();
  }

  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals and files (anything with a dot: embed.js, sitemap.xml, icon.svg).
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
