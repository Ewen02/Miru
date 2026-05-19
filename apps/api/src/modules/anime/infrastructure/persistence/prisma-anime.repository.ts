import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { generateUniqueAnimeSlug } from "@shared/infrastructure/prisma/generate-unique-slug";
import {
  AnimeAccentPreview,
  AnimeFilters,
  AnimeRepositoryPort,
  EpisodeAiringRow,
} from "../../domain/ports/anime-repository.port";
import { EpisodeInput } from "../../domain/ports/episode-sync.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeStatus } from "@miru/types";
import {
  INCLUDE_CARD,
  INCLUDE_FULL,
  toDomainCard,
  toDomainFull,
  toPersistence,
} from "./anime-prisma.mappers";
import { syncCharacters, syncPlatforms, syncRelations } from "./anime-prisma-sync.helper";

/**
 * Catalogue-wide exclusion of NSFW titles. Applied in every discovery /
 * listing query — not on `findById*` so we can still load an existing
 * record for purging or internal sync flows.
 */
const NSFW_EXCLUDE: Prisma.AnimeWhereInput = {
  genres: { none: { slug: "hentai" } },
};

@Injectable()
export class PrismaAnimeRepository implements AnimeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
    return record ? toDomainFull(record) : null;
  }

  async findBySlug(slug: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { slug },
      include: INCLUDE_FULL,
    });
    return record ? toDomainFull(record) : null;
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
    return record ? toDomainFull(record) : null;
  }

  async findByFilters(
    filters: AnimeFilters,
    pagination: PaginatedQuery,
  ): Promise<PaginatedResult<AnimeEntity>> {
    // NSFW exclusion goes in AND so it can't be silently dropped by a later
    // assignment to `where.genres` when the user filters by genre.
    const where: Prisma.AnimeWhereInput = { AND: [NSFW_EXCLUDE] };

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
      // Drop "hentai" from the user-supplied list so URL hacking the chip
      // can't bypass the global filter.
      const safeGenres = filters.genres.filter((g) => g.toLowerCase() !== "hentai");
      if (safeGenres.length > 0) {
        where.genres = { some: { slug: { in: safeGenres } } };
      }
    }
    if (filters.studioSlug) {
      where.studio = { slug: filters.studioSlug };
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
      data: records.map(toDomainCard),
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
    return records.map(toDomainCard);
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
    return records.map(toDomainCard);
  }

  async findTrending(limit: number): Promise<AnimeEntity[]> {
    const records = await this.prisma.anime.findMany({
      take: limit,
      orderBy: { averageRating: "desc" },
      where: { status: "AIRING", ...NSFW_EXCLUDE },
      include: INCLUDE_CARD,
    });
    return records.map(toDomainCard);
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

  /**
   * Upsert idempotent d'un anime + ses relations + ses personnages.
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

    const payload = toPersistence({ ...snap, slug: finalSlug, externalMalId: safeMalId });
    const now = new Date();
    const where =
      snap.externalAnilistId != null
        ? { externalAnilistId: snap.externalAnilistId }
        : { id: snap.id };

    const saved = await this.prisma.anime.upsert({
      where,
      create: { ...payload, syncedAt: now },
      update: { ...payload, syncedAt: now, syncFailedAt: null },
      select: { id: true },
    });

    await this.prisma.$transaction(
      async (tx) => {
        if (snap.characters.length > 0) {
          await syncCharacters(tx, saved.id, snap.characters);
        }
        await syncRelations(tx, saved.id, snap.relations);
        await syncPlatforms(tx, saved.id, snap.platforms);
      },
      { timeout: 30000 },
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.anime.delete({ where: { id } });
  }

  async markSyncFailed(animeId: string): Promise<void> {
    await this.prisma.anime.update({
      where: { id: animeId },
      data: { syncFailedAt: new Date() },
    });
  }

  async findAiringEpisodesBetween(from: Date, to: Date): Promise<EpisodeAiringRow[]> {
    const rows = await this.prisma.episode.findMany({
      where: {
        airedAt: { gte: from, lt: to },
        anime: { ...NSFW_EXCLUDE },
      },
      orderBy: { airedAt: "asc" },
      include: {
        anime: {
          select: {
            slug: true,
            title: true,
            coverUrl: true,
            episodeCount: true,
            studio: { select: { name: true } },
          },
        },
      },
    });

    return rows
      .filter((r) => r.airedAt != null)
      .map((r) => ({
        animeId: r.animeId,
        animeSlug: r.anime.slug,
        animeTitle: r.anime.title,
        studioName: r.anime.studio?.name ?? null,
        coverUrl: r.anime.coverUrl,
        episodeCount: r.anime.episodeCount,
        episodeNumber: r.number,
        episodeTitle: r.title,
        airedAt: r.airedAt as Date,
      }));
  }
}
