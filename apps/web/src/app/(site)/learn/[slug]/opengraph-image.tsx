import { apiOr } from "@/lib/api";
import { OG_SIZE, ogImage } from "@/lib/og";
import type { Article } from "@/lib/types";

export const alt = "Founder guide on Foundura";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = await apiOr<Article | null>(`/articles/${encodeURIComponent((await params).slug)}`, null, 3600);
  return ogImage({ eyebrow: a ? `Founder guide, ${a.readMinutes} min read` : "Founder guides", title: a?.title ?? "Guides for Indian founders" });
}
