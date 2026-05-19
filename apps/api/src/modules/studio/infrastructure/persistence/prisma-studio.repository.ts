import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { StudioEntity } from "../../domain/entities/studio.entity";
import {
  StudioRepositoryPort,
  StudioStats,
} from "../../domain/ports/studio-repository.port";

const NSFW_HENTAI = "hentai";

@Injectable()
export class PrismaStudioRepository implements StudioRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<StudioEntity | null> {
    const record = await this.prisma.studio.findUnique({ where: { slug } });
    return record ? StudioEntity.create(record.id, { name: record.name, slug: record.slug }) : null;
  }

  async statsBySlug(slug: string): Promise<StudioStats> {
    // NSFW exclusion mirrors the catalog defaults — same titles can't show up
    // here either, even if a studio happens to have them in the DB.
    const baseWhere = {
      studio: { slug },
      genres: { none: { slug: NSFW_HENTAI } },
    } as const;

    const [total, tvCount, movieCount, agg] = await Promise.all([
      this.prisma.anime.count({ where: baseWhere }),
      this.prisma.anime.count({ where: { ...baseWhere, format: "TV" } }),
      this.prisma.anime.count({ where: { ...baseWhere, format: "MOVIE" } }),
      this.prisma.anime.aggregate({
        where: { ...baseWhere, averageRating: { not: null } },
        _avg: { averageRating: true },
      }),
    ]);

    return {
      totalAnimes: total,
      averageRating: agg._avg.averageRating ?? null,
      tvCount,
      movieCount,
    };
  }
}
