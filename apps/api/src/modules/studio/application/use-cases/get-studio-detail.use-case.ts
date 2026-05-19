import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PaginatedResult } from "@shared/domain/repository.port";
import { AnimeEntity } from "@modules/anime/domain/entities/anime.entity";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { ANIME_REPOSITORY } from "@modules/anime/application/tokens";
import { StudioEntity } from "../../domain/entities/studio.entity";
import {
  StudioRepositoryPort,
  StudioStats,
} from "../../domain/ports/studio-repository.port";
import { STUDIO_REPOSITORY } from "../tokens";

interface GetStudioDetailInput {
  slug: string;
  page: number;
  pageSize: number;
}

interface GetStudioDetailOutput {
  studio: StudioEntity;
  stats: StudioStats;
  animes: PaginatedResult<AnimeEntity>;
}

@Injectable()
export class GetStudioDetailUseCase
  implements UseCase<GetStudioDetailInput, GetStudioDetailOutput>
{
  constructor(
    @Inject(STUDIO_REPOSITORY) private readonly studios: StudioRepositoryPort,
    @Inject(ANIME_REPOSITORY) private readonly animes: AnimeRepositoryPort,
  ) {}

  async execute({ slug, page, pageSize }: GetStudioDetailInput): Promise<GetStudioDetailOutput> {
    const studio = await this.studios.findBySlug(slug);
    if (!studio) throw new NotFoundException(`Studio "${slug}" not found`);

    const [stats, animes] = await Promise.all([
      this.studios.statsBySlug(slug),
      this.animes.findByFilters({ studioSlug: slug }, { page, pageSize }),
    ]);

    return { studio, stats, animes };
  }
}
