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
  /** Most-watched genre + count, null when user has no completed anime. */
  topGenre: { name: string; slug: string; count: number } | null;
  /** Most-watched studio name + count. */
  topStudio: { name: string; count: number } | null;
  /** Earliest watchlist entry creation date — proxy for "first anime added". */
  firstAddedAt: Date | null;
  /** Current streak: consecutive days up to today with at least one episode watched. */
  currentStreakDays: number;
  /** Longest streak ever — used as a personal best. */
  longestStreakDays: number;
}

export interface YearInReviewMonth {
  /** 1-12 */
  month: number;
  completedCount: number;
}

export interface YearInReviewBreakdownRow {
  name: string;
  count: number;
}

export interface YearInReviewTopAnime {
  animeId: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  /** User's personal rating from the watchlist entry. */
  rating: number | null;
}

export interface YearInReview {
  year: number;
  completedCount: number;
  hoursWatched: number;
  moviesCount: number;
  reviewCount: number;
  /** completedCount last year, for YoY growth. */
  previousYearCompletedCount: number;
  months: YearInReviewMonth[];
  topAnime: YearInReviewTopAnime[];
  genres: YearInReviewBreakdownRow[];
  studios: YearInReviewBreakdownRow[];
}

export interface UserActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  current: boolean;
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
  /** Sympathisant (Pro) flag — derived from the billing fields on User. */
  isProByUserId(userId: string): Promise<boolean>;
  /** Heavier aggregation for the personal /lifetime-stats page. */
  lifetimeStatsByUserId(userId: string): Promise<UserLifetimeStats>;
  /** Per-user year-in-review aggregation. Bounded to a single calendar year. */
  yearInReviewByUserId(userId: string, year: number): Promise<YearInReview>;
  /** Active sessions for the user, newest first. Caller flags `current`. */
  activeSessionsByUserId(userId: string): Promise<Omit<UserActiveSession, "current">[]>;
  /** Revoke a single session by id. Scoped by userId for safety. */
  revokeSession(userId: string, sessionId: string): Promise<void>;
  /**
   * Preferences. Read returns defaults when no row exists yet
   * (UX matches the "default" toggles shown pre-fetch). Update
   * upserts and returns the new state.
   */
  preferencesByUserId(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, patch: UserPreferencesPatch): Promise<UserPreferences>;
  /** Hard delete. Cascades to all owned rows (watchlist, reviews, …). */
  deleteById(userId: string): Promise<void>;
  /** Updates the user's public bio. `null` clears it. */
  updateBio(userId: string, bio: string | null): Promise<void>;
}

export interface UserPreferences {
  emailNewEpisodes: boolean;
  emailWeeklyRecap: boolean;
  emailReviewReply: boolean;
  emailNewFollower: boolean;
  inAppEpisodeAired: boolean;
  inAppRecommendation: boolean;
  inAppMention: boolean;
  /** 0-23, or null when quiet hours disabled. */
  quietFromHour: number | null;
  quietToHour: number | null;
}

export type UserPreferencesPatch = Partial<UserPreferences>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  emailNewEpisodes: true,
  emailWeeklyRecap: true,
  emailReviewReply: false,
  emailNewFollower: false,
  inAppEpisodeAired: true,
  inAppRecommendation: true,
  inAppMention: true,
  quietFromHour: null,
  quietToHour: null,
};
