import type { PrismaClient } from "@prisma/client";

/**
 * Streaming platforms shown on anime cards. AnimeOnPlatform rows referencing
 * these are seeded later by the AniList sync — this just ensures the rows
 * exist with stable slugs so cards never render a "Platform not found".
 */
export const PLATFORMS: Array<{
  name: string;
  slug: string;
  baseUrl: string;
  color: string;
}> = [
  { name: "Crunchyroll", slug: "crunchyroll", baseUrl: "https://www.crunchyroll.com", color: "#F47521" },
  { name: "ADN", slug: "adn", baseUrl: "https://animationdigitalnetwork.com", color: "#0091EA" },
  { name: "Netflix", slug: "netflix", baseUrl: "https://www.netflix.com", color: "#E50914" },
  { name: "Prime Video", slug: "prime-video", baseUrl: "https://www.primevideo.com", color: "#00A8E1" },
  { name: "Disney+", slug: "disney-plus", baseUrl: "https://www.disneyplus.com", color: "#0E68C9" },
  { name: "HIDIVE", slug: "hidive", baseUrl: "https://www.hidive.com", color: "#00B8E0" },
];

export async function seedPlatforms(prisma: PrismaClient): Promise<number> {
  for (const p of PLATFORMS) {
    await prisma.platform.upsert({
      where: { slug: p.slug },
      create: { name: p.name, slug: p.slug, baseUrl: p.baseUrl, color: p.color },
      update: { name: p.name, baseUrl: p.baseUrl, color: p.color },
    });
  }
  return PLATFORMS.length;
}
