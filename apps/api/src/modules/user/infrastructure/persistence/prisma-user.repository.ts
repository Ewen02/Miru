import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  UserActiveSession,
  UserFavoriteAnime,
  UserLifetimeStats,
  UserProfileStats,
  UserPublicReview,
  UserRepositoryPort,
  YearInReview,
} from "../../domain/ports/user-repository.port";

const COMPLETED_STATUS = "COMPLETED";
const PLANNED_STATUS = "PLANNED";
const MOVIE_FORMAT = "MOVIE";
/** Rough proxy: most TV episodes run ~24 min. Good enough for a stat block. */
const AVG_EPISODE_MINUTES = 24;

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByHandle(handle: string): Promise<UserEntity | null> {
    // First try the raw id (cuid). Then case-insensitive name match — that's
    // our public "handle" until we add a dedicated `username` column.
    const byId = await this.prisma.user.findUnique({ where: { id: handle } });
    if (byId) return this.toEntity(byId);

    const byName = await this.prisma.user.findFirst({
      where: { name: { equals: handle, mode: "insensitive" } },
    });
    return byName ? this.toEntity(byName) : null;
  }

  async statsByUserId(userId: string): Promise<UserProfileStats> {
    const [completedCount, reviewCount, reviewRatings] = await Promise.all([
      this.prisma.watchlistEntry.count({
        where: { userId, status: COMPLETED_STATUS },
      }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.review.findMany({
        where: { userId },
        select: { rating: true },
      }),
    ]);

    const histogram = Array.from({ length: 10 }, () => 0);
    for (const { rating } of reviewRatings) {
      const bin = Math.min(9, Math.max(0, rating - 1));
      histogram[bin] += 1;
    }

    return {
      completedCount,
      hoursWatched: Math.round((completedCount * AVG_EPISODE_MINUTES) / 60),
      reviewCount,
      ratingHistogram: histogram,
    };
  }

  async favoritesByUserId(userId: string, limit: number): Promise<UserFavoriteAnime[]> {
    const entries = await this.prisma.watchlistEntry.findMany({
      where: { userId, isFavorite: true },
      orderBy: [{ rating: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
      take: limit,
      include: {
        anime: { select: { id: true, slug: true, title: true, coverUrl: true } },
      },
    });

    return entries.map((e) => ({
      id: e.anime.id,
      slug: e.anime.slug,
      title: e.anime.title,
      coverUrl: e.anime.coverUrl,
      rating: e.rating ?? null,
    }));
  }

  async reviewsByUserId(userId: string, limit: number): Promise<UserPublicReview[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        anime: { select: { id: true, slug: true, title: true, coverUrl: true } },
      },
    });

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
      anime: r.anime,
    }));
  }

  async joinedAt(userId: string): Promise<Date | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    return record?.createdAt ?? null;
  }

  async lifetimeStatsByUserId(userId: string): Promise<UserLifetimeStats> {
    const [
      completedCount,
      moviesCount,
      reviewAgg,
      watchlistTotal,
      watchlistPlanned,
      topGenreRow,
      topStudioRow,
      firstAdded,
    ] = await Promise.all([
      this.prisma.watchlistEntry.count({
        where: { userId, status: COMPLETED_STATUS },
      }),
      this.prisma.watchlistEntry.count({
        where: { userId, status: COMPLETED_STATUS, anime: { format: MOVIE_FORMAT } },
      }),
      this.prisma.review.aggregate({
        where: { userId },
        _count: { _all: true },
        _avg: { rating: true },
      }),
      this.prisma.watchlistEntry.count({ where: { userId } }),
      this.prisma.watchlistEntry.count({ where: { userId, status: PLANNED_STATUS } }),
      // Top genre across COMPLETED anime — grouped via the join table.
      this.prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
        SELECT g.name, COUNT(*)::bigint AS count
        FROM "WatchlistEntry" w
        JOIN "_AnimeGenres" ag ON ag."A" = w."animeId"
        JOIN "Genre" g ON g.id = ag."B"
        WHERE w."userId" = ${userId} AND w.status = ${COMPLETED_STATUS}
        GROUP BY g.id, g.name
        ORDER BY count DESC
        LIMIT 1
      `,
      this.prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
        SELECT s.name, COUNT(*)::bigint AS count
        FROM "WatchlistEntry" w
        JOIN "Anime" a ON a.id = w."animeId"
        JOIN "Studio" s ON s.id = a."studioId"
        WHERE w."userId" = ${userId} AND w.status = ${COMPLETED_STATUS}
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 1
      `,
      this.prisma.watchlistEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      completedCount,
      hoursWatched: Math.round((completedCount * AVG_EPISODE_MINUTES) / 60),
      moviesCount,
      reviewCount: reviewAgg._count._all,
      reviewAverageRating: reviewAgg._avg.rating ?? null,
      watchlistTotal,
      watchlistPlanned,
      topGenre: topGenreRow[0]
        ? { name: topGenreRow[0].name, count: Number(topGenreRow[0].count) }
        : null,
      topStudio: topStudioRow[0]
        ? { name: topStudioRow[0].name, count: Number(topStudioRow[0].count) }
        : null,
      firstAddedAt: firstAdded?.createdAt ?? null,
    };
  }

  async yearInReviewByUserId(userId: string, year: number): Promise<YearInReview> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const prevStart = new Date(Date.UTC(year - 1, 0, 1));
    const prevEnd = new Date(Date.UTC(year, 0, 1));

    // "Completed this year" uses completedAt when present, falling back to
    // updatedAt for legacy rows that didn't record the transition timestamp.
    const dateFilter = {
      OR: [
        { completedAt: { gte: start, lt: end } },
        { AND: [{ completedAt: null }, { updatedAt: { gte: start, lt: end } }] },
      ],
    };
    const prevDateFilter = {
      OR: [
        { completedAt: { gte: prevStart, lt: prevEnd } },
        { AND: [{ completedAt: null }, { updatedAt: { gte: prevStart, lt: prevEnd } }] },
      ],
    };

    const baseWhere = { userId, status: COMPLETED_STATUS, ...dateFilter };

    const [
      completedCount,
      previousYearCompletedCount,
      moviesCount,
      reviewCount,
      monthRows,
      topAnimeRows,
      genreRows,
      studioRows,
    ] = await Promise.all([
      this.prisma.watchlistEntry.count({ where: baseWhere }),
      this.prisma.watchlistEntry.count({
        where: { userId, status: COMPLETED_STATUS, ...prevDateFilter },
      }),
      this.prisma.watchlistEntry.count({
        where: { ...baseWhere, anime: { format: MOVIE_FORMAT } },
      }),
      this.prisma.review.count({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      // GROUP BY EXTRACT(MONTH FROM COALESCE(completedAt, updatedAt)).
      this.prisma.$queryRaw<Array<{ month: number; count: bigint }>>`
        SELECT EXTRACT(MONTH FROM COALESCE(w."completedAt", w."updatedAt"))::int AS month,
               COUNT(*)::bigint AS count
        FROM "WatchlistEntry" w
        WHERE w."userId" = ${userId}
          AND w.status = ${COMPLETED_STATUS}
          AND COALESCE(w."completedAt", w."updatedAt") >= ${start}
          AND COALESCE(w."completedAt", w."updatedAt") <  ${end}
        GROUP BY month
        ORDER BY month
      `,
      this.prisma.watchlistEntry.findMany({
        where: baseWhere,
        orderBy: [{ rating: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
        take: 5,
        include: {
          anime: { select: { id: true, slug: true, title: true, coverUrl: true } },
        },
      }),
      this.prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
        SELECT g.name, COUNT(*)::bigint AS count
        FROM "WatchlistEntry" w
        JOIN "_AnimeGenres" ag ON ag."A" = w."animeId"
        JOIN "Genre" g ON g.id = ag."B"
        WHERE w."userId" = ${userId}
          AND w.status = ${COMPLETED_STATUS}
          AND COALESCE(w."completedAt", w."updatedAt") >= ${start}
          AND COALESCE(w."completedAt", w."updatedAt") <  ${end}
        GROUP BY g.id, g.name
        ORDER BY count DESC
        LIMIT 6
      `,
      this.prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
        SELECT s.name, COUNT(*)::bigint AS count
        FROM "WatchlistEntry" w
        JOIN "Anime" a ON a.id = w."animeId"
        JOIN "Studio" s ON s.id = a."studioId"
        WHERE w."userId" = ${userId}
          AND w.status = ${COMPLETED_STATUS}
          AND COALESCE(w."completedAt", w."updatedAt") >= ${start}
          AND COALESCE(w."completedAt", w."updatedAt") <  ${end}
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    const monthsMap = new Map<number, number>();
    for (const row of monthRows) monthsMap.set(row.month, Number(row.count));
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      completedCount: monthsMap.get(i + 1) ?? 0,
    }));

    return {
      year,
      completedCount,
      hoursWatched: Math.round((completedCount * AVG_EPISODE_MINUTES) / 60),
      moviesCount,
      reviewCount,
      previousYearCompletedCount,
      months,
      topAnime: topAnimeRows.map((e) => ({
        animeId: e.anime.id,
        slug: e.anime.slug,
        title: e.anime.title,
        coverUrl: e.anime.coverUrl,
        rating: e.rating ?? null,
      })),
      genres: genreRows.map((r) => ({ name: r.name, count: Number(r.count) })),
      studios: studioRows.map((r) => ({ name: r.name, count: Number(r.count) })),
    };
  }

  async activeSessionsByUserId(
    userId: string,
  ): Promise<Omit<UserActiveSession, "current">[]> {
    const records = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
    return records;
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    // Scoped by userId so a user can't revoke someone else's session.
    await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });
  }

  private toEntity(record: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
    twoFactorEnabled: boolean | null;
  }): UserEntity {
    return UserEntity.create(record.id, {
      email: record.email,
      name: record.name,
      emailVerified: record.emailVerified,
      image: record.image,
      twoFactorEnabled: record.twoFactorEnabled ?? false,
    });
  }
}
