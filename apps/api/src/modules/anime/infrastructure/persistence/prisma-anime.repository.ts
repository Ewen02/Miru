import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { slugify } from "@shared/utils/slugify";
import { generateUniqueAnimeSlug } from "@shared/infrastructure/prisma/generate-unique-slug";
import {
  AnimeAccentPreview,
  AnimeFilters,
  AnimeRepositoryPort,
} from "../../domain/ports/anime-repository.port";
import { EpisodeInput } from "../../domain/ports/episode-sync.port";
import {
  AnimeEntity,
  AnimeRelationSummary,
  CharacterSummary,
  RelationType,
} from "../../domain/entities/anime.entity";
import { PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeStatus, AnimeFormat, CharacterRole } from "@miru/types";

/**
 * Profil léger pour les listes (catalogue, trending, sync).
 * N'expose PAS episodes ni characters — ils sont inutiles pour AnimeCard.
 */
const INCLUDE_CARD = {
  genres: true,
  studio: true,
} as const satisfies Prisma.AnimeInclude;

/**
 * Profil complet pour la fiche anime.
 * Ajoute episodes + characters (avec character + voiceActor).
 */
const INCLUDE_FULL = {
  ...INCLUDE_CARD,
  episodes: { orderBy: { number: "asc" } },
  characters: {
    include: { character: true, voiceActor: true },
    orderBy: { order: "asc" },
  },
  relations: true,
} as const satisfies Prisma.AnimeInclude;

type AnimeCardRecord = Prisma.AnimeGetPayload<{ include: typeof INCLUDE_CARD }>;
type AnimeFullRecord = Prisma.AnimeGetPayload<{ include: typeof INCLUDE_FULL }>;

@Injectable()
export class PrismaAnimeRepository implements AnimeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
    return record ? this.toDomainFull(record) : null;
  }

  async findBySlug(slug: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { slug },
      include: INCLUDE_FULL,
    });
    return record ? this.toDomainFull(record) : null;
  }

  async findAccentPreviewBySlug(slug: string): Promise<AnimeAccentPreview | null> {
    return this.prisma.anime.findUnique({
      where: { slug },
      select: { slug: true, title: true, accentHex: true },
    });
  }

  async findByAnilistId(anilistId: number): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { externalAnilistId: anilistId },
      include: INCLUDE_FULL,
    });
    return record ? this.toDomainFull(record) : null;
  }

  async findByFilters(
    filters: AnimeFilters,
    pagination: PaginatedQuery,
  ): Promise<PaginatedResult<AnimeEntity>> {
    const where: Prisma.AnimeWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.format) where.format = filters.format;
    if (filters.year) where.year = filters.year;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { titleJp: { contains: filters.search, mode: "insensitive" } },
        { titleEn: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.genres?.length) {
      where.genres = { some: { slug: { in: filters.genres } } };
    }

    const [records, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        include: INCLUDE_CARD,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { averageRating: "desc" },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomainCard(r)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      hasNext: pagination.page * pagination.pageSize < total,
    };
  }

  async findAllWithMalId(
    options: { limit?: number; airingOnly?: boolean } = {},
  ): Promise<AnimeEntity[]> {
    const where: Prisma.AnimeWhereInput = { externalMalId: { not: null } };
    if (options.airingOnly) where.status = AnimeStatus.AIRING;

    const records = await this.prisma.anime.findMany({
      where,
      include: INCLUDE_CARD,
      take: options.limit,
      orderBy: { averageRating: "desc" },
    });
    return records.map((r) => this.toDomainCard(r));
  }

  async findAllWithAnilistId(
    options: { limit?: number; airingOnly?: boolean } = {},
  ): Promise<AnimeEntity[]> {
    const where: Prisma.AnimeWhereInput = { externalAnilistId: { not: null } };
    if (options.airingOnly) where.status = AnimeStatus.AIRING;

    const records = await this.prisma.anime.findMany({
      where,
      include: INCLUDE_CARD,
      take: options.limit,
      orderBy: { averageRating: "desc" },
    });
    return records.map((r) => this.toDomainCard(r));
  }

  async saveEpisodes(animeId: string, episodes: EpisodeInput[]): Promise<void> {
    const payload = episodes.map((ep) => ({
      animeId,
      number: ep.number,
      title: ep.title,
      titleJp: ep.titleJp,
      titleRomaji: ep.titleRomaji,
      duration: ep.duration,
      airedAt: ep.airedAt,
      filler: ep.filler,
      recap: ep.recap,
      thumbnail: ep.thumbnail,
      url: ep.url,
    }));

    await this.prisma.$transaction([
      this.prisma.episode.deleteMany({ where: { animeId } }),
      this.prisma.episode.createMany({ data: payload, skipDuplicates: true }),
    ]);
  }

  async enrichEpisodes(
    animeId: string,
    updates: Array<{
      number: number;
      thumbnail: string | null;
      url: string | null;
      site: string | null;
    }>,
  ): Promise<number> {
    if (updates.length === 0) return 0;
    const operations = updates.map((u) =>
      this.prisma.episode.updateMany({
        where: { animeId, number: u.number },
        data: { thumbnail: u.thumbnail, url: u.url, site: u.site },
      }),
    );
    const results = await this.prisma.$transaction(operations);
    return results.reduce((acc, r) => acc + r.count, 0);
  }

  async findTrending(limit: number): Promise<AnimeEntity[]> {
    const records = await this.prisma.anime.findMany({
      take: limit,
      orderBy: { averageRating: "desc" },
      where: { status: "AIRING" },
      include: INCLUDE_CARD,
    });
    return records.map((r) => this.toDomainCard(r));
  }

  /**
   * Upsert idempotent.
   * Clé : externalAnilistId si présent (import sync), sinon id (création locale).
   */
  async save(entity: AnimeEntity): Promise<void> {
    const snap = entity.toSnapshot();

    const existingBySlug = await this.prisma.anime.findUnique({
      where: { slug: snap.slug },
      select: { id: true, externalAnilistId: true },
    });
    const sameEntity =
      existingBySlug != null &&
      (existingBySlug.id === snap.id ||
        (snap.externalAnilistId != null &&
          existingBySlug.externalAnilistId === snap.externalAnilistId));

    const finalSlug =
      existingBySlug && !sameEntity
        ? await generateUniqueAnimeSlug(
            this.prisma,
            snap.title,
            snap.year,
            snap.externalAnilistId,
            snap.id,
          )
        : snap.slug;

    let safeMalId = snap.externalMalId;
    if (safeMalId != null) {
      const malConflict = await this.prisma.anime.findUnique({
        where: { externalMalId: safeMalId },
        select: { id: true, externalAnilistId: true },
      });
      const isSelf =
        malConflict != null &&
        (malConflict.id === snap.id ||
          (snap.externalAnilistId != null &&
            malConflict.externalAnilistId === snap.externalAnilistId));
      if (malConflict != null && !isSelf) safeMalId = null;
    }

    const payload = this.toPersistence({ ...snap, slug: finalSlug, externalMalId: safeMalId });
    const where =
      snap.externalAnilistId != null
        ? { externalAnilistId: snap.externalAnilistId }
        : { id: snap.id };

    const saved = await this.prisma.anime.upsert({
      where,
      create: payload,
      update: payload,
      select: { id: true },
    });

    if (snap.characters.length > 0) {
      await this.syncCharacters(saved.id, snap.characters);
    }

    await this.syncRelations(saved.id, snap.relations);
  }

  private async syncRelations(animeId: string, relations: AnimeRelationSummary[]): Promise<void> {
    const data = relations.map((r) => ({
      animeId,
      relatedExternalAnilistId: r.relatedExternalAnilistId,
      relationType: r.relationType,
      title: r.title,
      coverUrl: r.coverUrl,
      format: r.format,
      year: r.year,
    }));

    await this.prisma.$transaction([
      this.prisma.animeRelation.deleteMany({ where: { animeId } }),
      ...(data.length > 0
        ? [this.prisma.animeRelation.createMany({ data, skipDuplicates: true })]
        : []),
    ]);
  }

  async findSlugsByAnilistIds(anilistIds: number[]): Promise<Map<number, string>> {
    if (anilistIds.length === 0) return new Map();
    const records = await this.prisma.anime.findMany({
      where: { externalAnilistId: { in: anilistIds } },
      select: { externalAnilistId: true, slug: true },
    });
    const map = new Map<number, string>();
    for (const r of records) {
      if (r.externalAnilistId != null) map.set(r.externalAnilistId, r.slug);
    }
    return map;
  }

  private async syncCharacters(animeId: string, characters: CharacterSummary[]): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
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
      },
      { timeout: 30000 },
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.anime.delete({ where: { id } });
  }

  // --- Mappers privés domain ↔ persistence ---

  private toDomainCard(record: AnimeCardRecord): AnimeEntity {
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
    });
  }

  private toDomainFull(record: AnimeFullRecord): AnimeEntity {
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
        voiceActorAnilistId: ac.voiceActor?.externalAnilistId ?? null,
        voiceActorName: ac.voiceActor?.name ?? null,
        order: ac.order,
      })),
    });
  }

  private toPersistence(snap: ReturnType<AnimeEntity["toSnapshot"]>) {
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
}
