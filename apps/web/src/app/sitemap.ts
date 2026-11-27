import { CITY_INFO } from "@/cities/directory";
import { TILES } from "@/funding/directory";
import { CHAPTERS } from "@/basics/chapters";
import type { MetadataRoute } from "next";
import { LANGS } from "@/i18n/config";
import { languagesFor, urlFor } from "@/seo";
import { DOCS } from "@/documents";
import { apiOr, STARTUPS_TAG } from "@/lib/api";
import type { ArticleSummary, InvestorPublic, Scheme, StartupPublic } from "@/lib/types";
import { FOUNDER_GUIDES, GUIDE_PATH } from "@/founders/guides";


// Built on request (data cached for an hour), so a build without the API never ships an empty sitemap.
export const dynamic = "force-dynamic";

/** Public pages only. Dashboards, admin, sign-in and the embed widget are left out on purpose. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [schemes, articles, investors, startups] = await Promise.all([
    apiOr<Scheme[]>("/schemes", [], 3600),
    apiOr<ArticleSummary[]>("/articles", [], 3600),
    apiOr<InvestorPublic[]>("/investors", [], 3600),
    // Cleared whenever a founder changes their profile or an editor hides a listing.
    apiOr<StartupPublic[]>("/startups", [], 600, [STARTUPS_TAG]),
  ]);
  // Every page exists in every language (English at the plain URL); each entry lists them all as alternates.
  const page = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number, lastModified?: string | null) =>
    LANGS.map((lang) => ({
      url: urlFor(path, lang),
      changeFrequency,
      priority: lang === "en" ? priority : Math.max(0.1, Math.round((priority - 0.1) * 10) / 10),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: languagesFor(path) },
    }));
  return [
    page("/", "weekly", 1),
    page("/scan", "monthly", 0.9),
    page("/schemes", "weekly", 0.9),
    page("/events", "daily", 0.8),
    page("/policy", "daily", 0.7),
    page("/learn", "daily", 0.7),
    page("/documents", "monthly", 0.8),
    page("/glossary", "monthly", 0.6),
    ...DOCS.map((d) => page(`/documents/${d.slug}`, "monthly", 0.7)),
    page("/startups", "daily", 0.7),
    page("/investors", "weekly", 0.6),
    page("/funding", "monthly", 0.7),
    page("/perks", "monthly", 0.7),
    page("/investor-update", "yearly", 0.6),
    page("/basics", "monthly", 0.8),
    ...CHAPTERS.map((c) => page(`/basics/${c.slug}`, "monthly", 0.7)),
    page("/sectors/medtech", "monthly", 0.8),
    page("/sectors/software", "monthly", 0.8),
    page("/sectors/msme", "monthly", 0.8),
    page("/sectors/agritech", "monthly", 0.8),
    page("/partners", "monthly", 0.4),
    page("/states", "monthly", 0.7),
    page("/cities", "monthly", 0.7),
    ...CITY_INFO.map((c) => page(`/cities/${c.id}`, "weekly", 0.6)),
    page("/data", "weekly", 0.5),
    page("/numbers", "weekly", 0.5),
    page("/founder-guides", "monthly", 0.7),
    page("/rounds", "weekly", 0.7),
    ...FOUNDER_GUIDES.map((g) => page(GUIDE_PATH[g], "monthly", 0.7)),
    ...Object.keys(TILES).map((c) => page(`/states/${c.toLowerCase()}`, "monthly", 0.6)),
    page("/about", "yearly", 0.5),
    page("/contact", "yearly", 0.4),
    page("/privacy", "yearly", 0.3),
    page("/terms", "yearly", 0.3),
    ...schemes.map((s) => page(`/schemes/${s.slug}`, "monthly", 0.8, s.lastVerifiedAt)),
    ...articles.map((a) => page(`/learn/${a.slug}`, "yearly", 0.6, a.publishedAt)),
    ...investors.map((i) => page(`/investors/${i.slug}`, "monthly", 0.4)),
    ...startups.map((s) => page(`/startups/${s.slug}`, "weekly", 0.5, s.updatedAt)),
  ].flat();
}
