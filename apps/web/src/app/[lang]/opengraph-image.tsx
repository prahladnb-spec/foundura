import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Foundura: find the schemes, investors and events your startup qualifies for";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "Free help for founders", title: "Everything your startup needs, from idea to investors", stamp: "Free" });
}
