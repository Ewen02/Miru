import { Entity } from "@shared/domain/entity.base";
import { WatchStatus } from "@miru/types";
import { InvalidWatchlistRatingException } from "../exceptions/watchlist.exceptions";

interface WatchlistEntryProps {
  userId: string;
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * Composite-keyed entity: a user has at most one WatchlistEntry per anime.
 * The id is synthetic (`${userId}:${animeId}`) so we can reuse Entity.equals
 * and Entity.id without changing the base class.
 */
export class WatchlistEntryEntity extends Entity<WatchlistEntryProps> {
  get userId(): string {
    return this.props.userId;
  }

  get animeId(): string {
    return this.props.animeId;
  }

  get status(): WatchStatus {
    return this.props.status;
  }

  get currentEpisode(): number {
    return this.props.currentEpisode;
  }

  get rating(): number | null {
    return this.props.rating;
  }

  get isFavorite(): boolean {
    return this.props.isFavorite;
  }

  get startedAt(): Date | null {
    return this.props.startedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  setStatus(next: WatchStatus): void {
    this.props.status = next;
    if (next === WatchStatus.WATCHING && !this.props.startedAt) {
      this.props.startedAt = new Date();
    }
    if (next === WatchStatus.COMPLETED && !this.props.completedAt) {
      this.props.completedAt = new Date();
    }
  }

  setCurrentEpisode(value: number): void {
    this.props.currentEpisode = Math.max(0, value);
  }

  setRating(rating: number | null): void {
    if (rating !== null && (rating < 1 || rating > 10)) {
      throw new InvalidWatchlistRatingException(rating);
    }
    this.props.rating = rating;
  }

  setFavorite(value: boolean): void {
    this.props.isFavorite = value;
  }

  /** Canal d'accès pour la couche persistence. */
  toSnapshot(): Readonly<WatchlistEntryProps> {
    return { ...this.props };
  }

  static create(props: WatchlistEntryProps): WatchlistEntryEntity {
    return new WatchlistEntryEntity(`${props.userId}:${props.animeId}`, props);
  }
}
