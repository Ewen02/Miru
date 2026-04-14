import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PaginatedResult } from "@shared/domain/repository.port";
import { AnimeRepositoryPort, AnimeFilters } from "../../domain/ports/anime-repository.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { ANIME_REPOSITORY } from "../tokens";

interface GetAnimeCatalogInput {
  filters: AnimeFilters;
  page: number;
  pageSize: number;
}

@Injectable()
export class GetAnimeCatalogUseCase implements UseCase<GetAnimeCatalogInput, PaginatedResult<AnimeEntity>> {
  constructor(
    @Inject(ANIME_REPOSITORY)
    private readonly animeRepository: AnimeRepositoryPort,
  ) {}

  async execute(input: GetAnimeCatalogInput): Promise<PaginatedResult<AnimeEntity>> {
    return this.animeRepository.findByFilters(input.filters, {
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
