import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";

/**
 * The visitor's IP, to forward to the API so its rate limits apply per person rather than to
 * this web server. Takes the last X-Forwarded-For entry, which is the one our own reverse proxy
 * (Caddy) added; earlier entries can be set by anyone.
 */
export async function clientIpHeader(): Promise<Record<string, string>> {
  const h = await headers();
  const last = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean).pop() ?? h.get("x-real-ip") ?? "";
  return isIP(last) ? { "X-Forwarded-For": last } : {};
}
