import { clientIpHeader } from "@/lib/client-ip";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/** Verifies the code with the API and keeps the session token in an httpOnly cookie (never exposed to scripts). */
export async function POST(req: Request) {
  const res = await fetch(`${API_URL}/v1/auth/verify-otp`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: await req.text(),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  const out = NextResponse.json({ user: data.user, isNew: data.isNew });
  out.cookies.set(SESSION_COOKIE, data.token, sessionCookieOptions);
  return out;
}
