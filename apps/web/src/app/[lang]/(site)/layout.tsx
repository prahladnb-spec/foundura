import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const t = getDict(lang);
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white px-3 py-2 rounded z-50"
      >
        {t.common.skipToContent}
      </a>
      <SiteHeader lang={lang} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
