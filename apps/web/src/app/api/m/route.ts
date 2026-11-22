import { metricBeaconSchema } from "@foundura/shared";
import { API_URL } from "@/lib/api";
import { clientIpHeader } from "@/lib/client-ip";

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|node-fetch/i;

/**
 * Anonymous usage beacon. Only the metric and a page path or template slug are counted;
 * no IP address, cookie, user id or browser detail is stored.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = metricBeaconSchema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400 });
  // The visitor's address goes along only so the API's rate limit applies per visitor; it isn't stored.
  await fetch(`${API_URL}/v1/metrics`, {
    method: "POST",
    headers: { ...(await clientIpHeader()), "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  }).catch(() => undefined);
  return new Response(null, { status: 204 });
}
