import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

export interface RemoveFromWatchlistInput {
  userId: string;
  animeId: string;
}

@Injectable()
export class RemoveFromWatchlistUseCase implements UseCase<RemoveFromWatchlistInput, void> {
  constructor(
    @Inject(WATCHLIST_REPOSITORY)
    private readonly repo: WatchlistRepositoryPort,
  ) {}

  async execute({ userId, animeId }: RemoveFromWatchlistInput): Promise<void> {
    await this.repo.remove(userId, animeId);
  }
}
