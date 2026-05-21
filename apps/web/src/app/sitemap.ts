import type { MetadataRoute } from "next";
import { fetchAnimeCatalog, fetchGenres } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

export const revalidate = 3600;

const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/calendar", priority: 0.8, changeFrequency: "daily" },
  { path: "/top", priority: 0.8, changeFrequency: "weekly" },
  { path: "/search", priority: 0.4, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/help", priority: 0.3, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.3, changeFrequency: "monthly" },
];

/**
 * Dynamic sitemap. Pulls the top 250 anime, all genres, the current year's
 * season page, plus a handful of static landing routes. Auth-gated pages
 * (watchlist, profile, security…) are never listed.
 *
 * Cached for 1h (`revalidate`) to keep the API load low.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [catalog, genres] = await Promise.all([
    fetchAnimeCatalog({ pageSize: 250 }).catch(() => null),
    fetchGenres().catch(() => []),
  ]);

  const animeEntries: MetadataRoute.Sitemap =
    catalog?.data.map((a) => ({
      url: `${SITE_URL}/anime/${a.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) ?? [];

  const genreEntries: MetadataRoute.Sitemap = genres.map((g) => ({
    url: `${SITE_URL}/genre/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((s) => ({
    url: `${SITE_URL}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const currentYear = now.getFullYear();
  const seasonEntry: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/seasons/${currentYear}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  };

  return [...staticEntries, seasonEntry, ...genreEntries, ...animeEntries];
}
