import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { GenreRepositoryPort, GenreStats } from "../../domain/ports/genre-repository.port";
import { GenreEntity } from "../../domain/entities/genre.entity";

const NSFW_SLUGS = ["hentai"];

@Injectable()
export class PrismaGenreRepository implements GenreRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<GenreEntity[]> {
    const records = await this.prisma.genre.findMany({
      where: { slug: { notIn: NSFW_SLUGS } },
      orderBy: { name: "asc" },
    });
    return records.map((r) => GenreEntity.create(r.id, { name: r.name, slug: r.slug }));
  }

  async findBySlug(slug: string): Promise<GenreEntity | null> {
    if (NSFW_SLUGS.includes(slug)) return null;
    const record = await this.prisma.genre.findUnique({ where: { slug } });
    return record ? GenreEntity.create(record.id, { name: record.name, slug: record.slug }) : null;
  }

  async statsBySlug(slug: string): Promise<GenreStats> {
    if (NSFW_SLUGS.includes(slug)) {
      return { totalAnimes: 0, thisYearAnimes: 0, averageRating: null };
    }
    const year = new Date().getFullYear();
    const baseWhere = { genres: { some: { slug } } } as const;

    const [total, thisYear, agg] = await Promise.all([
      this.prisma.anime.count({ where: baseWhere }),
      this.prisma.anime.count({ where: { ...baseWhere, year } }),
      this.prisma.anime.aggregate({
        where: { ...baseWhere, averageRating: { not: null } },
        _avg: { averageRating: true },
      }),
    ]);

    return {
      totalAnimes: total,
      thisYearAnimes: thisYear,
      averageRating: agg._avg.averageRating ?? null,
    };
  }
}
