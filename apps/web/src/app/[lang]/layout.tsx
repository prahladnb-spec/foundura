import { UsageCounter } from "@/components/usage-counter";
import "@fontsource-variable/anek-latin/wdth.css";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/600.css";
// Arabic and Hebrew: only the script's own subset downloads, and only on pages that use it.
import "@fontsource-variable/noto-sans-arabic/wght.css";
import "@fontsource-variable/noto-sans-hebrew/wdth.css";
import "@fontsource-variable/anek-bangla/wght.css";
import "@fontsource-variable/anek-gujarati/wght.css";
import "@fontsource-variable/anek-telugu/wght.css";
import "@fontsource-variable/anek-tamil/wght.css";
import "@fontsource-variable/anek-kannada/wght.css";
import "../globals.css";
import { anekLatin, mukta } from "../fonts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/i18n";
import { isLang, LANG_INFO, LANGS } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";

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
    <html lang={LANG_INFO[lang].tag} dir={LANG_INFO[lang].dir} className={`${anekLatin.variable} ${mukta.variable}`}>
      <body className="min-h-screen">
        <I18nProvider lang={lang} t={getDict(lang)}>
          {children}
        </I18nProvider>
        <UsageCounter />
      </body>
    </html>
  );
}
