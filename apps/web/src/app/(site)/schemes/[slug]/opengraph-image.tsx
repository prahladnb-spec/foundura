import { apiOr } from "@/lib/api";
import { OG_SIZE, ogImage } from "@/lib/og";
import { stateLabel } from "@/lib/labels";
import type { Scheme } from "@/lib/types";

export const alt = "Government scheme on Foundura";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = await apiOr<Scheme | null>(`/schemes/${encodeURIComponent((await params).slug)}`, null, 3600);
  if (!s) return ogImage({ eyebrow: "Government schemes", title: "Find the schemes your startup qualifies for" });
  const where = s.level === "state" && s.state ? `${stateLabel(s.state)} government scheme` : "Central government scheme";
  return ogImage({ eyebrow: where, title: s.name, stamp: "Do you qualify?" });
}
