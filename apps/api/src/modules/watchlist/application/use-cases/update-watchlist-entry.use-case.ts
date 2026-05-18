import { Injectable, Inject } from "@nestjs/common";
import { WatchStatus } from "@miru/types";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchlistEntryEntity } from "../../domain/entities/watchlist-entry.entity";
import {
  InvalidWatchStatusException,
  WatchlistEntryNotFoundException,
} from "../../domain/exceptions/watchlist.exceptions";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

export interface UpdateWatchlistEntryInput {
  userId: string;
  animeId: string;
  status?: string;
  currentEpisode?: number;
  rating?: number | null;
  isFavorite?: boolean;
}

const VALID_STATUSES = new Set<string>(Object.values(WatchStatus));

@Injectable()
export class UpdateWatchlistEntryUseCase
  implements UseCase<UpdateWatchlistEntryInput, WatchlistEntryEntity>
{
  constructor(
    @Inject(WATCHLIST_REPOSITORY)
    private readonly repo: WatchlistRepositoryPort,
  ) {}

  async execute(input: UpdateWatchlistEntryInput): Promise<WatchlistEntryEntity> {
    const entry = await this.repo.findOne(input.userId, input.animeId);
    if (!entry) {
      throw new WatchlistEntryNotFoundException(input.userId, input.animeId);
    }

    if (input.status !== undefined) {
      if (!VALID_STATUSES.has(input.status)) {
        throw new InvalidWatchStatusException(input.status);
      }
      entry.setStatus(input.status as WatchStatus);
    }
    if (input.currentEpisode !== undefined) {
      entry.setCurrentEpisode(input.currentEpisode);
    }
    if (input.rating !== undefined) {
      entry.setRating(input.rating);
    }
    if (input.isFavorite !== undefined) {
      entry.setFavorite(input.isFavorite);
    }

    await this.repo.save(entry);
    return entry;
  }
}
