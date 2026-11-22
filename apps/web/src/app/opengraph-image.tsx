import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Foundura: find the schemes, investors and events your startup qualifies for";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "Scheme Scan for Indian startups", title: "Which government schemes does your startup qualify for?", stamp: "Free" });
}
