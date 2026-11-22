import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { getToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Forwards signed-in requests to the API's /v1/me/* routes, adding the session token from the cookie.
 * Only /me is proxied, so the browser can never reach admin endpoints through here.
 */
async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const { path } = await ctx.params;
  const sub = path.map(encodeURIComponent).join("/");
  const target = `${API_URL}/v1/me${sub === "_" ? "" : `/${sub}`}`;
  const res = await fetch(target, {
    method: req.method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    cache: "no-store",
  });
  const text = await res.text();
  const out = new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
  if (res.status === 401) out.cookies.delete(SESSION_COOKIE);
  return out;
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
