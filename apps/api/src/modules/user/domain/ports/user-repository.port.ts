import { UserEntity } from "../entities/user.entity";

export interface UserProfileStats {
  /** Anime in COMPLETED watchlist status. */
  completedCount: number;
  /** Rough estimate: completedCount × average episode runtime (24 min). */
  hoursWatched: number;
  /** Total reviews published by this user. */
  reviewCount: number;
  /** Rating distribution from this user's published Reviews — 10 bins. */
  ratingHistogram: number[];
}

export interface UserFavoriteAnime {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
}

export interface UserPublicReview {
  id: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  anime: { id: string; slug: string; title: string; coverUrl: string | null };
}

export interface UserLifetimeStats {
  completedCount: number;
  hoursWatched: number;
  /** Movies watched (anime with format === MOVIE in COMPLETED). */
  moviesCount: number;
  reviewCount: number;
  reviewAverageRating: number | null;
  /** Watchlist totals across all statuses. */
  watchlistTotal: number;
  watchlistPlanned: number;
  /** Most-watched genre slug + count, null when user has no completed anime. */
  topGenre: { name: string; count: number } | null;
  /** Most-watched studio name + count. */
  topStudio: { name: string; count: number } | null;
  /** Earliest watchlist entry creation date — proxy for "first anime added". */
  firstAddedAt: Date | null;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<UserEntity | null>;
  /**
   * Resolve a public-facing handle to a user. Accepts the raw user `id`
   * first, then falls back to a case-insensitive `name` match.
   */
  findByHandle(handle: string): Promise<UserEntity | null>;
  statsByUserId(userId: string): Promise<UserProfileStats>;
  favoritesByUserId(userId: string, limit: number): Promise<UserFavoriteAnime[]>;
  reviewsByUserId(userId: string, limit: number): Promise<UserPublicReview[]>;
  joinedAt(userId: string): Promise<Date | null>;
  /** Heavier aggregation for the personal /lifetime-stats page. */
  lifetimeStatsByUserId(userId: string): Promise<UserLifetimeStats>;
}
