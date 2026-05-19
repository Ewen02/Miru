import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  UserFavoriteAnime,
  UserProfileStats,
  UserPublicReview,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";

const COMPLETED_STATUS = "COMPLETED";
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

  private toEntity(record: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
  }): UserEntity {
    return UserEntity.create(record.id, {
      email: record.email,
      name: record.name,
      emailVerified: record.emailVerified,
      image: record.image,
    });
  }
}
