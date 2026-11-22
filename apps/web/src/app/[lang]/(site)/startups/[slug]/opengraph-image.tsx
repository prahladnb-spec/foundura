import { apiOr } from "@/lib/api";
import { lookingForLabel, sectorLabel } from "@/lib/labels";
import { OG_SIZE, ogImage } from "@/lib/og";
import type { StartupPublic } from "@/lib/types";

export const alt = "Startup on Foundura";
export const size = OG_SIZE;
export const contentType = "image/png";

// The share-image fonts cover Latin script only, so names in other scripts get a generic title.
const latin = (s: string | null | undefined) => !!s && !/[^\u0000-ɏ -⁯₹]/.test(s);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = await apiOr<StartupPublic | null>(`/startups/${encodeURIComponent((await params).slug)}`, null, 0);
  if (!s) return ogImage({ eyebrow: "Startup showcase", title: "What Indian founders are building" });
  const eyebrow = s.sectors.length ? `${sectorLabel(s.sectors[0])} startup on Foundura` : "Startup on Foundura";
  const title = latin(s.name) ? s.name : "A startup on Foundura";
  return ogImage({ eyebrow, title, stamp: s.lookingFor.length ? `Wants ${lookingForLabel(s.lookingFor[0]).toLowerCase()}` : undefined });
}
