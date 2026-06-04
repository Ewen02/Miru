import type { MetadataRoute } from "next";
import { fetchAnimeCatalog, fetchGenres } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

export const revalidate = 3600;

// Pagination budget for the anime catalog. The catalog holds ~4,500 titles;
// we walk it in pages of 250 up to this many pages (5,000 URLs) so the
// sitemap stays close to complete without unbounded API load. If the catalog
// ever exceeds this, the overflow is logged rather than silently dropped.
const ANIME_PAGE_SIZE = 250;
const ANIME_MAX_PAGES = 20;

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
  { path: "/trending", priority: 0.5, changeFrequency: "daily" },
  { path: "/forum", priority: 0.5, changeFrequency: "daily" },
  { path: "/clubs", priority: 0.4, changeFrequency: "weekly" },
  { path: "/polls", priority: 0.4, changeFrequency: "weekly" },
  { path: "/editorial", priority: 0.5, changeFrequency: "weekly" },
];

/** Walk the paginated anime catalog up to ANIME_MAX_PAGES, collecting slugs. */
async function fetchAllAnimeSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1; page <= ANIME_MAX_PAGES; page++) {
    const result = await fetchAnimeCatalog({ page, pageSize: ANIME_PAGE_SIZE }).catch(() => null);
    if (!result) break;
    for (const anime of result.data) slugs.push(anime.slug);
    if (!result.hasNext) return slugs;
    if (page === ANIME_MAX_PAGES && result.hasNext) {
      console.warn(
        `sitemap: anime catalog exceeds ${ANIME_MAX_PAGES * ANIME_PAGE_SIZE} URLs; remaining pages omitted.`,
      );
    }
  }
  return slugs;
}

/**
 * Dynamic sitemap. Walks the full anime catalog (paginated), all genres, the
 * current season, plus static landing routes. Auth-gated and personalized
 * pages (watchlist, profile, security, for-you…) are never listed.
 *
 * Entity routes without a bulk-listing API endpoint (studios, characters,
 * people, public lists, public profiles) are not enumerable here yet — adding
 * them requires listing endpoints on the API.
 *
 * Cached for 1h (`revalidate`) to keep the API load low.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [animeSlugs, genres] = await Promise.all([
    fetchAllAnimeSlugs(),
    fetchGenres().catch(() => []),
  ]);

  const animeEntries: MetadataRoute.Sitemap = animeSlugs.map((slug) => ({
    url: `${SITE_URL}/anime/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

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
