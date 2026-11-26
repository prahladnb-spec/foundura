import { getDict } from "@/i18n";
import { isLang, LANG_INFO, LANGS, lp } from "@/i18n/config";

/**
 * The web app manifest, one per language, so the installed app opens in the language the
 * founder installed it from. Linked from the root layout. Nothing here is personal.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en";
  const t = getDict(lang);
  const manifest = {
    id: lp(lang, "/"),
    name: "Foundura",
    short_name: "Foundura",
    description: t.meta.description,
    lang: LANG_INFO[lang].tag,
    dir: LANG_INFO[lang].dir,
    start_url: lp(lang, "/"),
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#f7f8fc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t.chrome.nav.scan, url: lp(lang, "/scan"), icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: t.chrome.nav.events, url: lp(lang, "/events"), icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: t.chrome.nav.documents, url: lp(lang, "/documents"), icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: t.chrome.myStartup, url: lp(lang, "/dashboard"), icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400" },
  });
}
