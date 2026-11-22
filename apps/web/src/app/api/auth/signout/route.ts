import { langOfPath, lp } from "@/i18n/config";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Signs out and sends the browser home. The redirect is relative on purpose: behind the production
 * proxy, req.url carries the server's bind address (0.0.0.0), not the public host. Readers who
 * signed out from a page in another language go back to that language's home page.
 */
export async function POST(req: Request) {
  let home = "/";
  try {
    home = lp(langOfPath(new URL(req.headers.get("referer") ?? "").pathname), "/");
  } catch {
    // No or bad referer: English home.
  }
  const out = new NextResponse(null, { status: 303, headers: { Location: home } });
  out.cookies.delete(SESSION_COOKIE);
  return out;
}
