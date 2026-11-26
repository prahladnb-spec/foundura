import { clientIpHeader } from "@/lib/client-ip";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** Sign up for the weekly email (the API sends a confirmation link). */
export async function POST(req: Request) {
  const res = await fetch(`${API_URL}/v1/newsletter/subscribe`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: await req.text(),
    cache: "no-store",
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
