import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { slugify } from "@shared/utils/slugify";
import { AnimeRepositoryPort, AnimeFilters } from "../../domain/ports/anime-repository.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeStatus, AnimeFormat } from "@miru/types";

const INCLUDE = { genres: true, studio: true } as const satisfies Prisma.AnimeInclude;

type AnimeRecord = Prisma.AnimeGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class PrismaAnimeRepository implements AnimeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { id },
      include: INCLUDE,
    });
    return record ? this.toDomain(record) : null;
  }

  async findByAnilistId(anilistId: number): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { externalAnilistId: anilistId },
      include: INCLUDE,
    });
    return record ? this.toDomain(record) : null;
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
        include: INCLUDE,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { averageRating: "desc" },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      hasNext: pagination.page * pagination.pageSize < total,
    };
  }

  async findTrending(limit: number): Promise<AnimeEntity[]> {
    const records = await this.prisma.anime.findMany({
      take: limit,
      orderBy: { averageRating: "desc" },
      where: { status: "AIRING" },
      include: INCLUDE,
    });
    return records.map((r) => this.toDomain(r));
  }

  /**
   * Upsert idempotent.
   * Clé : externalAnilistId si présent (import sync), sinon id (création locale).
   */
  async save(entity: AnimeEntity): Promise<void> {
    const snap = entity.toSnapshot();
    const payload = this.toPersistence(snap);
    const where = snap.externalAnilistId != null
      ? { externalAnilistId: snap.externalAnilistId }
      : { id: snap.id };

    await this.prisma.anime.upsert({ where, create: payload, update: payload });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.anime.delete({ where: { id } });
  }

  // --- Mappers privés domain ↔ persistence ---

  private toDomain(record: AnimeRecord): AnimeEntity {
    return AnimeEntity.create(record.id, {
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
      trailerUrl: record.trailerUrl,
      averageRating: record.averageRating,
      externalAnilistId: record.externalAnilistId,
      genres: record.genres.map((g) => g.slug),
    });
  }

  private toPersistence(snap: ReturnType<AnimeEntity["toSnapshot"]>) {
    const base = {
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
      trailerUrl: snap.trailerUrl,
      averageRating: snap.averageRating,
      externalAnilistId: snap.externalAnilistId,
    };

    const studio = snap.studioName && snap.studioSlug
      ? {
          studio: {
            connectOrCreate: {
              where: { slug: snap.studioSlug },
              create: { name: snap.studioName, slug: snap.studioSlug },
            },
          },
        }
      : {};

    const genres = snap.genres.length > 0
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
