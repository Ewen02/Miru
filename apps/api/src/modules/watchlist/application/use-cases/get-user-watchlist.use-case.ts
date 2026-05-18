import { Injectable, Inject } from "@nestjs/common";
import { WatchStatus } from "@miru/types";
import { UseCase } from "@shared/domain/use-case.base";
import {
  WatchlistEntryWithAnime,
  WatchlistRepositoryPort,
} from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

export interface GetUserWatchlistInput {
  userId: string;
  status?: WatchStatus;
}

@Injectable()
export class GetUserWatchlistUseCase
  implements UseCase<GetUserWatchlistInput, WatchlistEntryWithAnime[]>
{
  constructor(
    @Inject(WATCHLIST_REPOSITORY)
    private readonly repo: WatchlistRepositoryPort,
  ) {}

  async execute({ userId, status }: GetUserWatchlistInput): Promise<WatchlistEntryWithAnime[]> {
    return this.repo.findByUser(userId, status);
  }
}
