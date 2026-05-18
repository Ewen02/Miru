import type { Prisma } from "@miru/db";
import {
  AnimePlatformSummary,
  AnimeRelationSummary,
  CharacterSummary,
} from "../../domain/entities/anime.entity";

type TxClient = Prisma.TransactionClient;

/**
 * Synchronise les relations d'un anime (suite, préquelle, etc.).
 * Wipe & insert : simple et idempotent, le volume est faible (< 10 relations / anime).
 */
export async function syncRelations(
  tx: TxClient,
  animeId: string,
  relations: AnimeRelationSummary[],
): Promise<void> {
  await tx.animeRelation.deleteMany({ where: { animeId } });
  if (relations.length === 0) return;

  const data = relations.map((r) => ({
    animeId,
    relatedExternalAnilistId: r.relatedExternalAnilistId,
    relationType: r.relationType,
    title: r.title,
    coverUrl: r.coverUrl,
    format: r.format,
    year: r.year,
  }));
  await tx.animeRelation.createMany({ data, skipDuplicates: true });
}

/**
 * Synchronise les personnages d'un anime et leurs voice actors.
 * Upserts en série dans la transaction pour préserver les FK et l'ordre.
 */
export async function syncCharacters(
  tx: TxClient,
  animeId: string,
  characters: CharacterSummary[],
): Promise<void> {
  for (const c of characters) {
    const character = await tx.character.upsert({
      where: { externalAnilistId: c.externalAnilistId },
      create: {
        externalAnilistId: c.externalAnilistId,
        name: c.name,
        nameJp: c.nameJp,
        imageUrl: c.imageUrl,
      },
      update: {
        name: c.name,
        nameJp: c.nameJp,
        imageUrl: c.imageUrl,
      },
      select: { id: true },
    });

    let voiceActorId: string | null = null;
    if (c.voiceActorAnilistId != null && c.voiceActorName) {
      const va = await tx.voiceActor.upsert({
        where: { externalAnilistId: c.voiceActorAnilistId },
        create: {
          externalAnilistId: c.voiceActorAnilistId,
          name: c.voiceActorName,
        },
        update: { name: c.voiceActorName },
        select: { id: true },
      });
      voiceActorId = va.id;
    }

    await tx.animeCharacter.upsert({
      where: { animeId_characterId: { animeId, characterId: character.id } },
      create: {
        animeId,
        characterId: character.id,
        voiceActorId,
        role: c.role,
        order: c.order,
      },
      update: {
        voiceActorId,
        role: c.role,
        order: c.order,
      },
    });
  }
}

/**
 * Synchronise les plateformes de streaming d'un anime.
 * Upsert chaque Platform par baseUrl (clé naturelle), puis l'AnimeOnPlatform.
 * Wipe les liens qui ne sont plus présents pour rester aligné avec l'upstream.
 */
export async function syncPlatforms(
  tx: TxClient,
  animeId: string,
  platforms: AnimePlatformSummary[],
): Promise<void> {
  const keptPlatformIds: string[] = [];

  for (const p of platforms) {
    const baseUrl = (() => {
      try {
        return new URL(p.url).origin;
      } catch {
        return null;
      }
    })();
    if (!baseUrl) continue;

    const platform = await tx.platform.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        iconUrl: p.iconUrl,
        color: p.color,
        baseUrl,
      },
      update: {
        name: p.name,
        iconUrl: p.iconUrl,
        color: p.color,
        baseUrl,
      },
      select: { id: true },
    });
    keptPlatformIds.push(platform.id);

    await tx.animeOnPlatform.upsert({
      where: { animeId_platformId: { animeId, platformId: platform.id } },
      create: { animeId, platformId: platform.id, url: p.url, source: "ANILIST" },
      update: { url: p.url, source: "ANILIST" },
    });
  }

  await tx.animeOnPlatform.deleteMany({
    where: { animeId, platformId: { notIn: keptPlatformIds } },
  });
}
