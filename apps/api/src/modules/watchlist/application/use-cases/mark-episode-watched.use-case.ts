import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  episodeId: string;
}

@Injectable()
export class MarkEpisodeWatchedUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(WATCHLIST_REPOSITORY) private readonly repo: WatchlistRepositoryPort,
  ) {}

  async execute({ userId, episodeId }: Input): Promise<void> {
    await this.repo.markEpisodeWatched(userId, episodeId);
  }
}
