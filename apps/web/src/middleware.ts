import { type NextRequest, NextResponse } from "next/server";

/**
 * Language routing. English keeps today's URLs (served internally from /en/...), Hindi lives
 * under /hi/... The editor console is English-only.
 */
/** Request header carrying the original path of an editor console page. */
const PATH_HEADER = "x-foundura-path";

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
  // The editor console's layout needs the requested page to send people back to it after sign-in.
  if (/^\/admin(\/|$)/.test(pathname)) {
    const headers = new Headers(req.headers);
    headers.set(PATH_HEADER, pathname);
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals and files (anything with a dot: embed.js, sitemap.xml, icon.svg).
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
