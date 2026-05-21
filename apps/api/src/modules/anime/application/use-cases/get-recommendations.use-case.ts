import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { AnimeEntity } from "../../domain/entities/anime.entity";
import { AnimeRepositoryPort } from "../../domain/ports/anime-repository.port";
import { ANIME_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  limit?: number;
}

const DEFAULT_LIMIT = 20;

/**
 * Personalized recommendations. Scoring is delegated to the repository (raw
 * SQL) — the use case stays a thin orchestrator so the algorithm can change
 * without touching auth/HTTP boundaries.
 */
@Injectable()
export class GetRecommendationsUseCase implements UseCase<Input, AnimeEntity[]> {
  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
  ) {}

  async execute({ userId, limit }: Input): Promise<AnimeEntity[]> {
    return this.repo.findRecommendedForUser(userId, limit ?? DEFAULT_LIMIT);
  }
}
