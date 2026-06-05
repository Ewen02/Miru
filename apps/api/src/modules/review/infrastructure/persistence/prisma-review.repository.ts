import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ReviewEntity } from "../../domain/entities/review.entity";
import {
  AnimeReviewStats,
  ReviewDetailView,
  ReviewRepositoryPort,
  ReviewWithAuthor,
} from "../../domain/ports/review-repository.port";

@Injectable()
export class PrismaReviewRepository implements ReviewRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ReviewEntity | null> {
    const record = await this.prisma.review.findUnique({ where: { id } });
    return record ? toEntity(record) : null;
  }

  async findByUserAndAnime(userId: string, animeId: string): Promise<ReviewEntity | null> {
    const record = await this.prisma.review.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    return record ? toEntity(record) : null;
  }

  async listForAnime(animeId: string): Promise<ReviewWithAuthor[]> {
    const records = await this.prisma.review.findMany({
      where: { animeId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    return records.map((r) => ({
      review: toEntity(r),
      author: r.user,
    }));
  }

  async save(review: ReviewEntity): Promise<void> {
    const snap = review.toSnapshot();
    await this.prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { userId_animeId: { userId: snap.userId, animeId: snap.animeId } },
        create: {
          id: snap.id,
          userId: snap.userId,
          animeId: snap.animeId,
          rating: snap.rating,
          body: snap.body,
        },
        update: {
          rating: snap.rating,
          body: snap.body,
        },
      });
      await refreshAnimeReviewStats(tx, snap.animeId);
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const removed = await tx.review.findUnique({
        where: { id },
        select: { animeId: true },
      });
      await tx.review.deleteMany({ where: { id } });
      if (removed) await refreshAnimeReviewStats(tx, removed.animeId);
    });
  }

  async statsForAnime(animeId: string): Promise<AnimeReviewStats> {
    // Read straight from the denormalized columns instead of re-aggregating.
    // Same payload shape as before — callers don't change.
    const row = await this.prisma.anime.findUnique({
      where: { id: animeId },
      select: { averageRating: true, reviewCount: true },
    });
    return {
      averageRating: row?.averageRating ?? null,
      count: row?.reviewCount ?? 0,
    };
  }

  async findDetailById(reviewId: string): Promise<ReviewDetailView | null> {
    const record = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        anime: { select: { slug: true, title: true } },
        user: { select: { id: true, name: true, image: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    if (!record) return null;

    return {
      id: record.id,
      animeId: record.animeId,
      animeSlug: record.anime.slug,
      animeTitle: record.anime.title,
      rating: record.rating,
      body: record.body,
      createdAt: record.createdAt,
      author: record.user,
      comments: record.comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: c.user,
      })),
    };
  }

  async addComment(reviewId: string, userId: string, body: string): Promise<void> {
    await this.prisma.reviewComment.create({
      data: { reviewId, userId, body },
    });
  }

  async reviewExists(reviewId: string): Promise<boolean> {
    const row = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });
    return row !== null;
  }
}

/**
 * Recompute Anime.averageRating + Anime.reviewCount from scratch inside
 * the caller's transaction. Cheap — one AVG + COUNT scan per affected
 * anime — and stays consistent under concurrent review writes because
 * the surrounding transaction serialises Review and Anime updates for
 * the same animeId.
 */
async function refreshAnimeReviewStats(
  tx: Prisma.TransactionClient,
  animeId: string,
): Promise<void> {
  const agg = await tx.review.aggregate({
    where: { animeId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await tx.anime.update({
    where: { id: animeId },
    data: {
      averageRating: agg._avg.rating,
      reviewCount: agg._count._all,
    },
  });
}

interface ReviewRow {
  id: string;
  userId: string;
  animeId: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toEntity(record: ReviewRow): ReviewEntity {
  return ReviewEntity.create(record.id, {
    userId: record.userId,
    animeId: record.animeId,
    rating: record.rating,
    body: record.body,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
