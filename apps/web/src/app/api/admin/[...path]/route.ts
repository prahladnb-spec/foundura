import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/session";

/**
 * Forwards admin console requests to /v1/admin/* with the signed-in user's token.
 * The API decides who is an admin (ADMIN_EMAILS); the admin API key never reaches the browser.
 */
async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const { path } = await ctx.params;
  const contentType = req.headers.get("content-type")?.startsWith("text/csv") ? "text/csv" : "application/json";
  const res = await fetch(`${API_URL}/v1/admin/${path.map(encodeURIComponent).join("/")}`, {
    method: req.method,
    headers: { "Content-Type": contentType, Authorization: `Bearer ${token}` },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    cache: "no-store",
  });
  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export { forward as GET, forward as POST, forward as PUT };
