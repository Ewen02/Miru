import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ReviewEntity } from "../../domain/entities/review.entity";
import {
  AnimeReviewStats,
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
    await this.prisma.review.upsert({
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
  }

  async remove(id: string): Promise<void> {
    await this.prisma.review.deleteMany({ where: { id } });
  }

  async statsForAnime(animeId: string): Promise<AnimeReviewStats> {
    const result = await this.prisma.review.aggregate({
      where: { animeId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return {
      averageRating: result._avg.rating,
      count: result._count._all,
    };
  }
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
