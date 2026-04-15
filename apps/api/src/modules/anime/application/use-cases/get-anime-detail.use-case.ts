import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { AnimeRepositoryPort } from "../../domain/ports/anime-repository.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { AnimeNotFoundException } from "../../domain/exceptions/anime.exceptions";
import { ANIME_REPOSITORY } from "../tokens";

@Injectable()
export class GetAnimeDetailUseCase implements UseCase<string, AnimeEntity> {
  constructor(
    @Inject(ANIME_REPOSITORY)
    private readonly animeRepository: AnimeRepositoryPort,
  ) {}

  async execute(slug: string): Promise<AnimeEntity> {
    const anime = await this.animeRepository.findBySlug(slug);

    if (!anime) {
      throw new AnimeNotFoundException(slug);
    }

    return anime;
  }
}
