import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  WatchedEpisodeSummary,
  WatchlistRepositoryPort,
} from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  animeId: string;
}

@Injectable()
export class ListWatchedEpisodesUseCase implements UseCase<Input, WatchedEpisodeSummary[]> {
  constructor(
    @Inject(WATCHLIST_REPOSITORY) private readonly repo: WatchlistRepositoryPort,
  ) {}

  async execute({ userId, animeId }: Input): Promise<WatchedEpisodeSummary[]> {
    return this.repo.listWatchedEpisodes(userId, animeId);
  }
}
