import { clientIpHeader } from "@/lib/client-ip";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function POST(req: Request) {
  const res = await fetch(`${API_URL}/v1/auth/request-otp`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: await req.text(),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
