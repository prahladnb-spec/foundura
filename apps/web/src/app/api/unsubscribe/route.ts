import { clientIpHeader } from "@/lib/client-ip";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * Unsubscribe from scheme alerts. Used by the confirmation page (JSON body) and by mail apps'
 * one-click unsubscribe (RFC 8058), which POST with the link parameters in the query string.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  let u = url.searchParams.get("u");
  let t = url.searchParams.get("t");
  if ((!u || !t) && req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { u?: string; t?: string };
    u = body.u ?? null;
    t = body.t ?? null;
  }
  const res = await fetch(`${API_URL}/v1/digest/unsubscribe`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: JSON.stringify({ u, t }),
    cache: "no-store",
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
