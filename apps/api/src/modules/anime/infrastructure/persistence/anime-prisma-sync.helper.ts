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
 *
 * Stratégie : bulk upsert.
 *  1. `createMany skipDuplicates` sur Character et VoiceActor pour insérer
 *     les nouveaux (les conflits sont silencieusement ignorés).
 *  2. `updateMany` pour réaligner les champs mutables des entrées existantes
 *     (name, image…). Une seule requête par champ groupé.
 *  3. SELECT pour mapper `externalAnilistId → id`.
 *  4. `deleteMany` + `createMany` sur AnimeCharacter (pivot wipe-and-recreate).
 *
 * Bénéfices vs upsert en boucle :
 *  - ~N×3 round-trips → ~6 requêtes constantes (1 par étape)
 *  - Pas de race sur VoiceActor/Character partagés entre animes : le
 *    skipDuplicates absorbe les conflits qu'une transaction concurrente
 *    aurait créés une fraction de seconde plus tôt.
 *  - L'ordre/role est rejoué exactement (deleteMany d'abord).
 */
export async function syncCharacters(
  tx: TxClient,
  animeId: string,
  characters: CharacterSummary[],
): Promise<void> {
  if (characters.length === 0) {
    await tx.animeCharacter.deleteMany({ where: { animeId } });
    return;
  }

  // 1. Insère les nouveaux Character (skip si déjà présent par externalAnilistId).
  await tx.character.createMany({
    data: characters.map((c) => ({
      externalAnilistId: c.externalAnilistId,
      name: c.name,
      nameJp: c.nameJp,
      imageUrl: c.imageUrl,
    })),
    skipDuplicates: true,
  });

  // 2. Met à jour les champs mutables des Character existants. updateMany
  //    par id, en batch — on tolère le coût car le N est petit (~30/anime).
  for (const c of characters) {
    await tx.character.updateMany({
      where: { externalAnilistId: c.externalAnilistId },
      data: { name: c.name, nameJp: c.nameJp, imageUrl: c.imageUrl },
    });
  }

  // 3. Idem pour VoiceActor (seulement ceux avec un anilistId connu).
  const vasWithId = characters.filter(
    (c): c is CharacterSummary & { voiceActorAnilistId: number; voiceActorName: string } =>
      c.voiceActorAnilistId != null && Boolean(c.voiceActorName),
  );

  if (vasWithId.length > 0) {
    // Dédup par externalAnilistId pour éviter un createMany avec doublons
    // dans le même batch (un même VA peut doubler plusieurs persos).
    const dedupedVas = Array.from(
      new Map(vasWithId.map((c) => [c.voiceActorAnilistId, c])).values(),
    );
    await tx.voiceActor.createMany({
      data: dedupedVas.map((c) => ({
        externalAnilistId: c.voiceActorAnilistId,
        name: c.voiceActorName,
      })),
      skipDuplicates: true,
    });
    for (const c of dedupedVas) {
      await tx.voiceActor.updateMany({
        where: { externalAnilistId: c.voiceActorAnilistId },
        data: { name: c.voiceActorName },
      });
    }
  }

  // 4. Récupère les IDs internes (Character.externalAnilistId → id,
  //    VoiceActor.externalAnilistId → id) en deux SELECT groupés.
  const charIds = new Map(
    (
      await tx.character.findMany({
        where: { externalAnilistId: { in: characters.map((c) => c.externalAnilistId) } },
        select: { id: true, externalAnilistId: true },
      })
    ).map((row) => [row.externalAnilistId, row.id]),
  );

  const vaIds = new Map<number, string>(
    vasWithId.length === 0
      ? []
      : (
          await tx.voiceActor.findMany({
            where: {
              externalAnilistId: { in: vasWithId.map((c) => c.voiceActorAnilistId) },
            },
            select: { id: true, externalAnilistId: true },
          })
        )
          .filter((row): row is { id: string; externalAnilistId: number } =>
            row.externalAnilistId != null,
          )
          .map((row) => [row.externalAnilistId, row.id]),
  );

  // 5. Pivot wipe-and-recreate : l'ordre/role est rejoué à l'identique.
  await tx.animeCharacter.deleteMany({ where: { animeId } });
  await tx.animeCharacter.createMany({
    data: characters
      .map((c) => {
        const characterId = charIds.get(c.externalAnilistId);
        if (!characterId) return null;
        const voiceActorId =
          c.voiceActorAnilistId != null ? (vaIds.get(c.voiceActorAnilistId) ?? null) : null;
        return {
          animeId,
          characterId,
          voiceActorId,
          role: c.role,
          order: c.order,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null),
    skipDuplicates: true,
  });
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
