import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WatchStatus } from "@miru/types";
import { UseCase } from "@shared/domain/use-case.base";
import {
  WATCHLIST_ADDED_EVENT,
  WATCHLIST_COMPLETED_EVENT,
  type WatchlistAddedPayload,
  type WatchlistCompletedPayload,
} from "@shared/events/activity.events";
import { WatchlistEntryEntity } from "../../domain/entities/watchlist-entry.entity";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

export interface AddToWatchlistInput {
  userId: string;
  animeId: string;
  status?: WatchStatus;
}

@Injectable()
export class AddToWatchlistUseCase implements UseCase<AddToWatchlistInput, WatchlistEntryEntity> {
  constructor(
    @Inject(WATCHLIST_REPOSITORY)
    private readonly repo: WatchlistRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute(input: AddToWatchlistInput): Promise<WatchlistEntryEntity> {
    const existing = await this.repo.findOne(input.userId, input.animeId);
    if (existing) return existing;

    const status = input.status ?? WatchStatus.PLANNED;
    const entry = WatchlistEntryEntity.create({
      userId: input.userId,
      animeId: input.animeId,
      status,
      currentEpisode: 0,
      rating: null,
      isFavorite: false,
      startedAt: status === WatchStatus.WATCHING ? new Date() : null,
      completedAt: status === WatchStatus.COMPLETED ? new Date() : null,
    });
    await this.repo.save(entry);

    const completed = status === WatchStatus.COMPLETED;
    this.events.emit(WATCHLIST_ADDED_EVENT, {
      userId: input.userId,
      animeId: input.animeId,
      completed,
    } satisfies WatchlistAddedPayload);
    if (completed) {
      this.events.emit(WATCHLIST_COMPLETED_EVENT, {
        userId: input.userId,
        animeId: input.animeId,
      } satisfies WatchlistCompletedPayload);
    }

    return entry;
  }
}
