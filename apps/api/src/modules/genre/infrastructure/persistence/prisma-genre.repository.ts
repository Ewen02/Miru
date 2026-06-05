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

    // PERF-03: 3 separate count/aggregate queries collapsed into one
    // raw SELECT — Postgres scans the matching rows once.
    const rows = await this.prisma.$queryRaw<
      Array<{ total: bigint; this_year: bigint; avg_rating: number | null }>
    >`
      SELECT
        count(*)::bigint                                             AS total,
        count(*) FILTER (WHERE a."year" = ${year})::bigint           AS this_year,
        avg(a."averageRating") FILTER (WHERE a."averageRating" IS NOT NULL)::float8
                                                                     AS avg_rating
      FROM "Anime" a
      JOIN "_AnimeGenres" ag ON ag."A" = a.id
      JOIN "Genre" g         ON g.id = ag."B"
      WHERE g.slug = ${slug}
    `;
    const row = rows[0];

    return {
      totalAnimes: Number(row?.total ?? 0n),
      thisYearAnimes: Number(row?.this_year ?? 0n),
      averageRating: row?.avg_rating ?? null,
    };
  }
}
