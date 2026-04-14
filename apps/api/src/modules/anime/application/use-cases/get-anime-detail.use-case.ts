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

  async execute(id: string): Promise<AnimeEntity> {
    const anime = await this.animeRepository.findById(id);

    if (!anime) {
      throw new AnimeNotFoundException(id);
    }

    return anime;
  }
}
