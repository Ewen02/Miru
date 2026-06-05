import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { StudioEntity } from "../../domain/entities/studio.entity";
import { StudioRepositoryPort, StudioStats } from "../../domain/ports/studio-repository.port";

const NSFW_HENTAI = "hentai";

interface StatsRow {
  total: bigint;
  tv: bigint;
  movie: bigint;
  avg_rating: number | null;
}

@Injectable()
export class PrismaStudioRepository implements StudioRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<StudioEntity | null> {
    const record = await this.prisma.studio.findUnique({ where: { slug } });
    return record ? StudioEntity.create(record.id, { name: record.name, slug: record.slug }) : null;
  }

  async statsBySlug(slug: string): Promise<StudioStats> {
    // PERF-03: 4 separate count/aggregate calls collapsed into a single
    // GROUP-less aggregate with conditional COUNT — Postgres scans the
    // matching rows once and emits all four columns in one shot.
    // NSFW exclusion mirrors the catalog defaults.
    const rows = await this.prisma.$queryRaw<StatsRow[]>`
      SELECT
        count(*)::bigint                                       AS total,
        count(*) FILTER (WHERE a."format" = 'TV')::bigint      AS tv,
        count(*) FILTER (WHERE a."format" = 'MOVIE')::bigint   AS movie,
        avg(a."averageRating") FILTER (WHERE a."averageRating" IS NOT NULL)::float8
                                                               AS avg_rating
      FROM "Anime" a
      JOIN "Studio" s ON s.id = a."studioId"
      WHERE s.slug = ${slug}
        AND NOT EXISTS (
          SELECT 1 FROM "_AnimeGenres" ag
          JOIN "Genre" g ON g.id = ag."B"
          WHERE ag."A" = a.id AND g.slug = ${NSFW_HENTAI}
        )
    `;
    const row = rows[0];

    return {
      totalAnimes: Number(row?.total ?? 0n),
      averageRating: row?.avg_rating ?? null,
      tvCount: Number(row?.tv ?? 0n),
      movieCount: Number(row?.movie ?? 0n),
    };
  }
}
