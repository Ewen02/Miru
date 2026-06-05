import type { PrismaClient } from "@prisma/client";

/**
 * Canonical AniList genre list. Static — these don't churn upstream.
 * Idempotent via upsert on `slug` (slug-only update lets us rename
 * display names later without losing FK linkage).
 */
export const GENRES: Array<{ name: string; slug: string }> = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "Comedy", slug: "comedy" },
  { name: "Drama", slug: "drama" },
  { name: "Ecchi", slug: "ecchi" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Hentai", slug: "hentai" }, // present so the NSFW exclusion filter can match it
  { name: "Horror", slug: "horror" },
  { name: "Mahou Shoujo", slug: "mahou-shoujo" },
  { name: "Mecha", slug: "mecha" },
  { name: "Music", slug: "music" },
  { name: "Mystery", slug: "mystery" },
  { name: "Psychological", slug: "psychological" },
  { name: "Romance", slug: "romance" },
  { name: "Sci-Fi", slug: "sci-fi" },
  { name: "Slice of Life", slug: "slice-of-life" },
  { name: "Sports", slug: "sports" },
  { name: "Supernatural", slug: "supernatural" },
  { name: "Thriller", slug: "thriller" },
];

export async function seedGenres(prisma: PrismaClient): Promise<number> {
  for (const g of GENRES) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      create: g,
      update: { name: g.name },
    });
  }
  return GENRES.length;
}
