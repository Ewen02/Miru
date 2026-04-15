import { PrismaService } from "./prisma.service";
import { slugify } from "@shared/utils/slugify";

/**
 * Résout un slug unique pour un Anime en gérant les collisions.
 * Ordre de tentative : base → base-{year} → base-{anilistId}.
 */
export async function generateUniqueAnimeSlug(
  prisma: PrismaService,
  title: string,
  year: number | null,
  anilistId: number | null,
  currentAnimeId?: string,
): Promise<string> {
  const base = slugify(title) || "untitled";

  const candidates = [base];
  if (year != null) candidates.push(`${base}-${year}`);
  if (anilistId != null) candidates.push(`${base}-${anilistId}`);

  for (const candidate of candidates) {
    const existing = await prisma.anime.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === currentAnimeId) {
      return candidate;
    }
  }

  throw new Error(
    `Could not generate unique slug for title "${title}" (base: ${base})`,
  );
}
