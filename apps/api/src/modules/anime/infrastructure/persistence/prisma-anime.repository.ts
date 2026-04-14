import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { AnimeRepositoryPort, AnimeFilters } from "../../domain/ports/anime-repository.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeStatus, AnimeFormat } from "@miru/types";

@Injectable()
export class PrismaAnimeRepository implements AnimeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { id },
      include: { genres: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByAnilistId(anilistId: number): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { externalAnilistId: anilistId },
      include: { genres: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByFilters(
    filters: AnimeFilters,
    pagination: PaginatedQuery,
  ): Promise<PaginatedResult<AnimeEntity>> {
    const where: any = {};

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
        include: { genres: true },
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
      include: { genres: true },
    });

    return records.map((r) => this.toDomain(r));
  }

  async save(entity: AnimeEntity): Promise<void> {
    await this.prisma.anime.upsert({
      where: { id: entity.id },
      create: this.toPersistence(entity),
      update: this.toPersistence(entity),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.anime.delete({ where: { id } });
  }

  // --- Mappers privés domain ↔ persistence ---

  private toDomain(record: any): AnimeEntity {
    return AnimeEntity.create(record.id, {
      title: record.title,
      titleJp: record.titleJp,
      titleEn: record.titleEn,
      synopsis: record.synopsis,
      status: record.status as AnimeStatus,
      format: record.format as AnimeFormat,
      episodeCount: record.episodeCount,
      year: record.year,
      studioName: record.studioName,
      coverUrl: record.coverUrl,
      bannerUrl: record.bannerUrl,
      trailerUrl: record.trailerUrl,
      averageRating: record.averageRating,
      externalAnilistId: record.externalAnilistId,
      genres: record.genres?.map((g: any) => g.name) ?? [],
    });
  }

  private toPersistence(entity: AnimeEntity): any {
    return {
      id: entity.id,
      title: entity.title,
      titleJp: entity.titleJp,
      status: entity.status,
      format: entity.format,
      coverUrl: entity.coverUrl,
      averageRating: entity.averageRating,
    };
  }
}
