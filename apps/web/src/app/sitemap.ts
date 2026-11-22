import type { MetadataRoute } from "next";
import { apiOr } from "@/lib/api";
import type { ArticleSummary, InvestorPublic, Scheme } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Built on request (data cached for an hour), so a build without the API never ships an empty sitemap.
export const dynamic = "force-dynamic";

/** Public pages only. Dashboards, admin, sign-in and the embed widget are left out on purpose. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [schemes, articles, investors] = await Promise.all([
    apiOr<Scheme[]>("/schemes", [], 3600),
    apiOr<ArticleSummary[]>("/articles", [], 3600),
    apiOr<InvestorPublic[]>("/investors", [], 3600),
  ]);
  const page = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number, lastModified?: string | null) => ({
    url: `${SITE}${path}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  });
  return [
    page("/", "weekly", 1),
    page("/scan", "monthly", 0.9),
    page("/schemes", "weekly", 0.9),
    page("/events", "daily", 0.8),
    page("/policy", "daily", 0.7),
    page("/learn", "daily", 0.7),
    page("/investors", "weekly", 0.6),
    page("/partners", "monthly", 0.4),
    page("/privacy", "yearly", 0.3),
    ...schemes.map((s) => page(`/schemes/${s.slug}`, "monthly", 0.8, s.lastVerifiedAt)),
    ...articles.map((a) => page(`/learn/${a.slug}`, "yearly", 0.6, a.publishedAt)),
    ...investors.map((i) => page(`/investors/${i.slug}`, "monthly", 0.4)),
  ];
}
