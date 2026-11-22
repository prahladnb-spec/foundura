import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL("/", req.url), 303);
  out.cookies.delete(SESSION_COOKIE);
  return out;
}
