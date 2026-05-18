import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";

export class WatchlistEntryNotFoundException extends NotFoundException {
  constructor(userId: string, animeId: string) {
    super("WatchlistEntry", `${userId}:${animeId}`);
  }
}

export class InvalidWatchlistRatingException extends ValidationException {
  constructor(value: number) {
    super(`Watchlist rating must be between 1 and 10 (received ${value})`);
  }
}

export class InvalidWatchStatusException extends ValidationException {
  constructor(value: string) {
    super(`Unknown watch status "${value}"`);
  }
}
