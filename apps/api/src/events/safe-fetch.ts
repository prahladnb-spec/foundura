import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** True for addresses on the server's own network: loopback, private, link-local, unique-local, multicast. */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
  return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") || v.startsWith("ff");
}

export interface FetchLimits {
  /** Tests only: allow http:// and addresses on the local network. Never in production. */
  allowPrivate?: boolean;
  timeoutMs?: number;
  maxBytes?: number;
}

/**
 * Fetches a public web page or feed on behalf of an editor. Refuses anything but https, any host that
 * resolves to the server's own network (so a source can't be used to reach internal services), follows
 * at most 3 redirects with the same checks, and stops at maxBytes.
 */
export async function safeFetchText(url: string, limits: FetchLimits = {}): Promise<string> {
  const { allowPrivate = false, timeoutMs = 15_000, maxBytes = 2_000_000 } = limits;
  let target = new URL(url);
  for (let hop = 0; hop <= 3; hop++) {
    if (target.protocol !== "https:" && !(allowPrivate && target.protocol === "http:")) throw new Error("Only https:// addresses can be fetched");
    if (!allowPrivate) {
      const host = target.hostname.replace(/^\[|\]$/g, "");
      const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
      if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) throw new Error("That address points to a private network");
    }
    const res = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": "FounduraEventSync/1.0 (+https://foundura.org/events)", accept: "text/calendar, text/html;q=0.9, */*;q=0.5" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      target = new URL(res.headers.get("location")!, target);
      continue;
    }
    if (!res.ok) throw new Error(`The source answered ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader) return "";
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error(`The source is larger than ${Math.round(maxBytes / 1_000_000)} MB`);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new Error("Too many redirects");
}
