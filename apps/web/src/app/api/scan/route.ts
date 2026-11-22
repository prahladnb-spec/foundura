import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function POST(req: Request) {
  const res = await fetch(`${API_URL}/v1/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
