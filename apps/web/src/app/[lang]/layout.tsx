import "@fontsource-variable/anek-latin/wdth.css";
import "@fontsource-variable/anek-devanagari/wdth.css";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/600.css";
import "../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/i18n";
import { isLang, LANGS } from "@/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "en");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: t.meta.defaultTitle, template: "%s | Foundura" },
    description: t.meta.description,
    openGraph: { siteName: "Foundura", locale: t.meta.ogLocale, type: "website" },
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang === "hi" ? "hi-IN" : "en-IN"}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
