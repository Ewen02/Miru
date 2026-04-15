import { Injectable } from "@nestjs/common";
import type { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { slugify } from "@shared/utils/slugify";
import { generateUniqueAnimeSlug } from "@shared/infrastructure/prisma/generate-unique-slug";
import { AnimeRepositoryPort, AnimeFilters } from "../../domain/ports/anime-repository.port";
import { EpisodeInput } from "../../domain/ports/episode-sync.port";
import { AnimeEntity, CharacterSummary } from "../../domain/entities/anime.entity";
import { PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeStatus, AnimeFormat, CharacterRole } from "@miru/types";

const INCLUDE = {
  genres: true,
  studio: true,
  episodes: { orderBy: { number: "asc" } },
  characters: {
    include: { character: true, voiceActor: true },
    orderBy: { order: "asc" },
  },
} as const satisfies Prisma.AnimeInclude;

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

  async findBySlug(slug: string): Promise<AnimeEntity | null> {
    const record = await this.prisma.anime.findUnique({
      where: { slug },
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

  async findAllWithMalId(limit?: number): Promise<AnimeEntity[]> {
    const records = await this.prisma.anime.findMany({
      where: { externalMalId: { not: null } },
      include: INCLUDE,
      take: limit,
      orderBy: { averageRating: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async saveEpisodes(animeId: string, episodes: EpisodeInput[]): Promise<void> {
    for (const ep of episodes) {
      const data = {
        title: ep.title,
        titleJp: ep.titleJp,
        titleRomaji: ep.titleRomaji,
        duration: ep.duration,
        airedAt: ep.airedAt,
        filler: ep.filler,
        recap: ep.recap,
        thumbnail: ep.thumbnail,
        url: ep.url,
      };
      await this.prisma.episode.upsert({
        where: { animeId_number: { animeId, number: ep.number } },
        create: { animeId, number: ep.number, ...data },
        update: data,
      });
    }
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

    const existingBySlug = await this.prisma.anime.findUnique({
      where: { slug: snap.slug },
      select: { id: true, externalAnilistId: true },
    });
    const sameEntity =
      existingBySlug != null &&
      (existingBySlug.id === snap.id ||
        (snap.externalAnilistId != null &&
          existingBySlug.externalAnilistId === snap.externalAnilistId));

    const finalSlug =
      existingBySlug && !sameEntity
        ? await generateUniqueAnimeSlug(
            this.prisma,
            snap.title,
            snap.year,
            snap.externalAnilistId,
            snap.id,
          )
        : snap.slug;

    const payload = this.toPersistence({ ...snap, slug: finalSlug });
    const where = snap.externalAnilistId != null
      ? { externalAnilistId: snap.externalAnilistId }
      : { id: snap.id };

    const saved = await this.prisma.anime.upsert({
      where,
      create: payload,
      update: payload,
      select: { id: true },
    });

    if (snap.characters.length > 0) {
      await this.syncCharacters(saved.id, snap.characters);
    }
  }

  private async syncCharacters(
    animeId: string,
    characters: CharacterSummary[],
  ): Promise<void> {
    for (const c of characters) {
      const character = await this.prisma.character.upsert({
        where: { externalAnilistId: c.externalAnilistId },
        create: {
          externalAnilistId: c.externalAnilistId,
          name: c.name,
          nameJp: c.nameJp,
          imageUrl: c.imageUrl,
        },
        update: {
          name: c.name,
          nameJp: c.nameJp,
          imageUrl: c.imageUrl,
        },
        select: { id: true },
      });

      let voiceActorId: string | null = null;
      if (c.voiceActor) {
        const va = await this.prisma.voiceActor.upsert({
          where: { name: c.voiceActor },
          create: { name: c.voiceActor },
          update: {},
          select: { id: true },
        });
        voiceActorId = va.id;
      }

      await this.prisma.animeCharacter.upsert({
        where: { animeId_characterId: { animeId, characterId: character.id } },
        create: {
          animeId,
          characterId: character.id,
          voiceActorId,
          role: c.role,
          order: c.order,
        },
        update: {
          voiceActorId,
          role: c.role,
          order: c.order,
        },
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.anime.delete({ where: { id } });
  }

  // --- Mappers privés domain ↔ persistence ---

  private toDomain(record: AnimeRecord): AnimeEntity {
    return AnimeEntity.create(record.id, {
      slug: record.slug,
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
      externalMalId: record.externalMalId,
      genres: record.genres.map((g) => g.slug),
      episodes: record.episodes.map((e) => ({
        id: e.id,
        number: e.number,
        title: e.title,
        titleJp: e.titleJp,
        titleRomaji: e.titleRomaji,
        duration: e.duration,
        airedAt: e.airedAt,
        filler: e.filler,
        recap: e.recap,
        thumbnail: e.thumbnail,
        url: e.url,
      })),
      characters: record.characters.map((ac) => ({
        id: ac.character.id,
        externalAnilistId: ac.character.externalAnilistId,
        name: ac.character.name,
        nameJp: ac.character.nameJp,
        imageUrl: ac.character.imageUrl,
        role: ac.role as CharacterRole,
        voiceActor: ac.voiceActor?.name ?? null,
        order: ac.order,
      })),
    });
  }

  private toPersistence(snap: ReturnType<AnimeEntity["toSnapshot"]>) {
    const base = {
      slug: snap.slug,
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
      externalMalId: snap.externalMalId,
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
