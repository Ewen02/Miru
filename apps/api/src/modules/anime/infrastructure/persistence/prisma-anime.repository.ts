import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { generateUniqueAnimeSlug } from "@shared/infrastructure/prisma/generate-unique-slug";
import {
  AnimeAccentPreview,
  AnimeFilters,
  AnimeRepositoryPort,
  AnimeSort,
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

/** Past this many failed attempts, the retry cron stops picking up the row. */
const MAX_SYNC_RETRY_ATTEMPTS = 5;

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
    // Single year wins over the range — keeps the existing /seasons flow
    // and the search-pill UX intact.
    if (filters.year) {
      where.year = filters.year;
    } else if (filters.yearFrom != null || filters.yearTo != null) {
      where.year = {
        ...(filters.yearFrom != null ? { gte: filters.yearFrom } : {}),
        ...(filters.yearTo != null ? { lte: filters.yearTo } : {}),
      };
    }
    if (filters.episodesMin != null || filters.episodesMax != null) {
      where.episodeCount = {
        ...(filters.episodesMin != null ? { gte: filters.episodesMin } : {}),
        ...(filters.episodesMax != null ? { lte: filters.episodesMax } : {}),
      };
    }
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
    if (filters.streamingPlatforms?.length) {
      where.platforms = {
        some: { platform: { slug: { in: filters.streamingPlatforms } } },
      };
    }
    if (filters.sources?.length) {
      where.source = { in: filters.sources };
    }

    const orderBy = sortToOrderBy(filters.sort);

    const [records, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        include: INCLUDE_CARD,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy,
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
    // Exponential backoff: 1h, 4h, 12h, 24h, 48h. Past attempt 5 the row
    // is abandoned by the retry cron (findReadyForRetry filters on count).
    const current = await this.prisma.anime.findUnique({
      where: { id: animeId },
      select: { syncRetryCount: true },
    });
    const nextCount = (current?.syncRetryCount ?? 0) + 1;
    const backoffHours = [1, 4, 12, 24, 48][Math.min(nextCount - 1, 4)] ?? 48;
    const syncRetryAt = new Date(Date.now() + backoffHours * 60 * 60 * 1000);

    await this.prisma.anime.update({
      where: { id: animeId },
      data: {
        syncFailedAt: new Date(),
        syncRetryAt,
        syncRetryCount: nextCount,
      },
    });
  }

  async findReadyForRetry(limit: number): Promise<AnimeEntity[]> {
    const rows = await this.prisma.anime.findMany({
      where: {
        syncRetryAt: { lte: new Date(), not: null },
        syncRetryCount: { lt: MAX_SYNC_RETRY_ATTEMPTS },
      },
      orderBy: { syncRetryAt: "asc" },
      take: limit,
      include: INCLUDE_CARD,
    });
    return rows.map(toDomainCard);
  }

  async clearSyncRetry(animeId: string): Promise<void> {
    await this.prisma.anime.update({
      where: { id: animeId },
      data: { syncRetryAt: null, syncRetryCount: 0, syncFailedAt: null },
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

  async findRecommendedForUser(userId: string, limit: number): Promise<AnimeEntity[]> {
    // Three-CTE scoring with cold-start support:
    //   user_genre   → genres seen in WATCHING (weight 2) + COMPLETED (weight 2)
    //                  + PLANNED (weight 1, picks from onboarding count)
    //                  + UserPreferences.favoriteGenres (weight 1, explicit taste)
    //   user_studio  → same source set without prefs (no studio signal there)
    //   candidate    → per-anime score = sum(genre weights)*2 + max(studio weight)
    //
    // Excludes anything already in the watchlist (any status) and NSFW.
    //
    // The PLANNED + prefs branches solve the cold-start case: a brand-new
    // user who just finished /onboard has 3 PLANNED picks and a genre list
    // — enough signal to seed meaningful recos before they watch anything.
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      WITH user_genre AS (
        -- Genres from the user's own watchlist (weighted by status).
        SELECT g.id, SUM(CASE WHEN w.status = 'PLANNED' THEN 1 ELSE 2 END)::int AS weight
        FROM "WatchlistEntry" w
        JOIN "_AnimeGenres" ag ON ag."A" = w."animeId"
        JOIN "Genre" g ON g.id = ag."B"
        WHERE w."userId" = ${userId}
          AND w.status IN ('WATCHING', 'COMPLETED', 'PLANNED')
        GROUP BY g.id
        UNION ALL
        -- Explicit favourites picked at /onboard step 3.
        SELECT g.id, 1 AS weight
        FROM "UserPreferences" up
        JOIN "Genre" g ON g.slug = ANY(up."favoriteGenres")
        WHERE up."userId" = ${userId}
      ),
      user_studio AS (
        SELECT a."studioId" AS id, COUNT(*)::int AS weight
        FROM "WatchlistEntry" w
        JOIN "Anime" a ON a.id = w."animeId"
        WHERE w."userId" = ${userId}
          AND w.status IN ('WATCHING', 'COMPLETED')
          AND a."studioId" IS NOT NULL
        GROUP BY a."studioId"
      ),
      candidate AS (
        SELECT
          a.id,
          COALESCE(SUM(ug.weight), 0) * 2 + COALESCE(MAX(us.weight), 0) AS score,
          a."averageRating"
        FROM "Anime" a
        LEFT JOIN "_AnimeGenres" ag ON ag."A" = a.id
        LEFT JOIN (SELECT id, SUM(weight)::int AS weight FROM user_genre GROUP BY id) ug
          ON ug.id = ag."B"
        LEFT JOIN user_studio us ON us.id = a."studioId"
        WHERE a.id NOT IN (SELECT "animeId" FROM "WatchlistEntry" WHERE "userId" = ${userId})
          AND a.id NOT IN (
            SELECT ag2."A" FROM "_AnimeGenres" ag2
            JOIN "Genre" g2 ON g2.id = ag2."B"
            WHERE g2.slug = 'hentai'
          )
        GROUP BY a.id
      )
      SELECT id
      FROM candidate
      WHERE score > 0
      ORDER BY score DESC, "averageRating" DESC NULLS LAST
      LIMIT ${limit}
    `;

    if (rows.length === 0) return [];

    // Hydrate via the card include so toDomainCard can build entities.
    const records = await this.prisma.anime.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: INCLUDE_CARD,
    });

    // Preserve the score order from the raw query.
    const indexById = new Map(rows.map((r, i) => [r.id, i]));
    records.sort((a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0));
    return records.map(toDomainCard);
  }
}

/**
 * Map the public sort enum to the Prisma orderBy array. Defaults to RATING
 * because that's what the existing UI expected (orderBy: averageRating desc).
 * Multi-column orderings break ties so the page is stable across reloads.
 */
function sortToOrderBy(sort: AnimeSort | undefined): Prisma.AnimeOrderByWithRelationInput[] {
  switch (sort) {
    case "POPULARITY":
      return [{ reviewCount: "desc" }, { averageRating: "desc" }];
    case "RECENCY":
      return [{ year: { sort: "desc", nulls: "last" } }, { averageRating: "desc" }];
    case "EPISODE_COUNT":
      return [{ episodeCount: { sort: "desc", nulls: "last" } }, { averageRating: "desc" }];
    case "RATING":
    default:
      return [{ averageRating: { sort: "desc", nulls: "last" } }];
  }
}
