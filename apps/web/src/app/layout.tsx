import "@fontsource-variable/anek-latin/wdth.css";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/600.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Foundura — find the schemes, investors and events your startup qualifies for",
    template: "%s | Foundura",
  },
  description:
    "Free Scheme Scan for Indian startups: see which central and state government schemes you qualify for, with reasons. Plus investors, events, policy news and founder guides.",
  openGraph: { siteName: "Foundura", locale: "en_IN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
