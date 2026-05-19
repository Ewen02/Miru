import type { Prisma } from "@miru/db";
import { AnimeStatus, AnimeFormat, CharacterRole } from "@miru/types";
import { slugify } from "@shared/utils/slugify";
import {
  AnimeEntity,
  AnimeRelationSummary,
  RelationType,
} from "../../domain/entities/anime.entity";

/**
 * Profil léger pour les listes (catalogue, trending, sync).
 * N'expose PAS episodes ni characters — ils sont inutiles pour AnimeCard.
 */
export const INCLUDE_CARD = {
  genres: true,
  studio: true,
} as const satisfies Prisma.AnimeInclude;

/**
 * Profil complet pour la fiche anime.
 * Ajoute episodes + characters (avec character + voiceActor) + relations + platforms.
 */
export const INCLUDE_FULL = {
  ...INCLUDE_CARD,
  episodes: { orderBy: { number: "asc" } },
  characters: {
    include: { character: true, voiceActor: true },
    orderBy: { order: "asc" },
  },
  relations: true,
  platforms: {
    include: { platform: true },
    orderBy: { platform: { name: "asc" } },
  },
} as const satisfies Prisma.AnimeInclude;

export type AnimeCardRecord = Prisma.AnimeGetPayload<{ include: typeof INCLUDE_CARD }>;
export type AnimeFullRecord = Prisma.AnimeGetPayload<{ include: typeof INCLUDE_FULL }>;

export function toDomainCard(record: AnimeCardRecord): AnimeEntity {
  return AnimeEntity.create(record.id, {
    slug: record.slug,
    title: record.title,
    titleJp: record.titleJp,
    titleEn: record.titleEn,
    synopsis: record.synopsis,
    status: record.status as AnimeStatus,
    format: record.format as AnimeFormat,
    episodeCount: record.episodeCount,
    year: record.year,
    studioName: record.studio?.name ?? null,
    studioSlug: record.studio?.slug ?? null,
    coverUrl: record.coverUrl,
    bannerUrl: record.bannerUrl,
    accentHex: record.accentHex,
    averageRating: record.averageRating,
    externalAnilistId: record.externalAnilistId,
    externalMalId: record.externalMalId,
    genres: record.genres.map((g) => g.slug),
    episodes: [],
    characters: [],
    relations: [],
    platforms: [],
  });
}

export function toDomainFull(record: AnimeFullRecord): AnimeEntity {
  const relations: AnimeRelationSummary[] = record.relations.map((r) => ({
    relatedExternalAnilistId: r.relatedExternalAnilistId,
    relationType: r.relationType as RelationType,
    title: r.title,
    coverUrl: r.coverUrl,
    format: r.format,
    year: r.year,
  }));
  return AnimeEntity.create(record.id, {
    slug: record.slug,
    title: record.title,
    titleJp: record.titleJp,
    titleEn: record.titleEn,
    synopsis: record.synopsis,
    status: record.status as AnimeStatus,
    format: record.format as AnimeFormat,
    episodeCount: record.episodeCount,
    year: record.year,
    studioName: record.studio?.name ?? null,
    studioSlug: record.studio?.slug ?? null,
    coverUrl: record.coverUrl,
    bannerUrl: record.bannerUrl,
    accentHex: record.accentHex,
    averageRating: record.averageRating,
    externalAnilistId: record.externalAnilistId,
    externalMalId: record.externalMalId,
    genres: record.genres.map((g) => g.slug),
    relations,
    episodes: record.episodes.map((e) => ({
      id: e.id,
      number: e.number,
      title: e.title,
      titleJp: e.titleJp,
      titleRomaji: e.titleRomaji,
      duration: e.duration,
      airedAt: e.airedAt,
      filler: e.filler,
      recap: e.recap,
      thumbnail: e.thumbnail,
      url: e.url,
    })),
    characters: record.characters.map((ac) => ({
      id: ac.character.id,
      externalAnilistId: ac.character.externalAnilistId,
      name: ac.character.name,
      nameJp: ac.character.nameJp,
      imageUrl: ac.character.imageUrl,
      role: ac.role as CharacterRole,
      voiceActorId: ac.voiceActor?.id ?? null,
      voiceActorAnilistId: ac.voiceActor?.externalAnilistId ?? null,
      voiceActorName: ac.voiceActor?.name ?? null,
      order: ac.order,
    })),
    platforms: record.platforms.map((p) => ({
      slug: p.platform.slug,
      name: p.platform.name,
      iconUrl: p.platform.iconUrl,
      color: p.platform.color,
      url: p.url,
    })),
  });
}

export function toPersistence(snap: ReturnType<AnimeEntity["toSnapshot"]>) {
  const base = {
    slug: snap.slug,
    title: snap.title,
    titleJp: snap.titleJp,
    titleEn: snap.titleEn,
    synopsis: snap.synopsis,
    status: snap.status,
    format: snap.format,
    episodeCount: snap.episodeCount,
    year: snap.year,
    coverUrl: snap.coverUrl,
    bannerUrl: snap.bannerUrl,
    accentHex: snap.accentHex,
    averageRating: snap.averageRating,
    externalAnilistId: snap.externalAnilistId,
    externalMalId: snap.externalMalId,
  };

  const studio =
    snap.studioName && snap.studioSlug
      ? {
          studio: {
            connectOrCreate: {
              where: { slug: snap.studioSlug },
              create: { name: snap.studioName, slug: snap.studioSlug },
            },
          },
        }
      : {};

  const genres =
    snap.genres.length > 0
      ? {
          genres: {
            connectOrCreate: snap.genres.map((name) => {
              const slug = slugify(name);
              return { where: { slug }, create: { name, slug } };
            }),
          },
        }
      : {};

  return { ...base, ...studio, ...genres };
}
