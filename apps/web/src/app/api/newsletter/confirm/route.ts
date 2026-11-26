import { clientIpHeader } from "@/lib/client-ip";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** The confirm button on /newsletter/confirm. A button rather than the bare link, so mail scanners can't confirm. */
export async function POST(req: Request) {
  const res = await fetch(`${API_URL}/v1/newsletter/confirm`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: await req.text(),
    cache: "no-store",
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
