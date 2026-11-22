import { FORMAT } from "@/components/template-preview";
import { docBySlug } from "@/documents";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Free document template on Foundura";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const doc = docBySlug((await params).slug);
  if (!doc) return ogImage({ eyebrow: "Founder documents", title: "Free templates for Indian startups" });
  return ogImage({ eyebrow: "Free template and guide", title: doc.title, stamp: `${FORMAT[doc.template.kind]} file` });
}
