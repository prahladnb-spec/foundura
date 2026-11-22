import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

/** For uptime monitors: the API isn't public, so this checks web, API and database in one call. */
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/v1/health`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({ web: "up", api: res.ok ? "up" : "down", db: body.db ?? "unknown" }, { status: res.ok ? 200 : 503 });
  } catch {
    return NextResponse.json({ web: "up", api: "down", db: "unknown" }, { status: 503 });
  }
}
