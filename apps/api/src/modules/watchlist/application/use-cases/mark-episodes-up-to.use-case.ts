import { Inject, Injectable } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  animeId: string;
  upToEpisode: number;
}

interface Output {
  /** UserEpisode rows actually inserted (excludes ones that already existed). */
  newlyMarked: number;
  /** WatchlistEntry.currentEpisode after the update (capped at episodeCount). */
  currentEpisode: number;
}

/**
 * S4-07 — "Marquer jusqu'à l'épisode N". One-shot bulk catch-up flow used
 * after the user binge-watches and returns to Miru to log a chunk at once.
 *
 * Validates the upper bound at the application layer (1..5000) so a
 * pathological payload doesn't enumerate every Episode for the anime.
 * Idempotent: re-running with the same N is cheap (skipDuplicates) and
 * never demotes the WatchlistEntry's currentEpisode.
 */
@Injectable()
export class MarkEpisodesUpToUseCase implements UseCase<Input, Output> {
  constructor(@Inject(WATCHLIST_REPOSITORY) private readonly repo: WatchlistRepositoryPort) {}

  async execute({ userId, animeId, upToEpisode }: Input): Promise<Output> {
    if (!Number.isInteger(upToEpisode) || upToEpisode < 1 || upToEpisode > 5000) {
      throw new ValidationException("upToEpisode must be an integer between 1 and 5000");
    }
    return this.repo.markEpisodesUpTo(userId, animeId, upToEpisode);
  }
}
