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

/** Lightweight achievement summary for the public profile rail. */
export interface UserPublicAchievement {
  code: string;
  name: string;
  icon: string | null;
  unlockedAt: Date;
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
  /** Latest unlocked badges shown on the public profile rail. */
  recentAchievementsByUserId(userId: string, limit: number): Promise<UserPublicAchievement[]>;
  /** Follower/following counts for the profile header. */
  followCountsByUserId(userId: string): Promise<{ followers: number; following: number }>;
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
  /**
   * Hard delete (irreversible). Cascades to all owned rows (watchlist,
   * reviews, …). Used by the retention scheduler once the 30-day grace
   * window from softDelete has elapsed.
   */
  deleteById(userId: string): Promise<void>;
  /**
   * Mark the account for deletion in 30 days. Idempotent — calling on an
   * already-soft-deleted account is a no-op (the original deletedAt is
   * preserved so the grace timer doesn't restart).
   */
  softDelete(userId: string): Promise<void>;
  /** Cancel a pending soft deletion. No-op if the user wasn't soft-deleted. */
  restoreDeletion(userId: string): Promise<void>;
  /** Returns the soft-delete timestamp or null if the account is active. */
  deletedAt(userId: string): Promise<Date | null>;
  /** Updates the user's public bio. `null` clears it. */
  updateBio(userId: string, bio: string | null): Promise<void>;
  /**
   * Stamp `onboardedAt = now()` if not already set. Idempotent — repeat
   * calls keep the original timestamp so we always know when the user
   * first finished the flow.
   */
  markOnboarded(userId: string): Promise<void>;
  /** Returns the onboardedAt timestamp, or null when never onboarded. */
  onboardedAt(userId: string): Promise<Date | null>;
  /**
   * Snapshot fields used to compute re-engagement nudges (AniList import
   * banner, empty-watchlist hint). Bundled so the home page can ask one
   * question instead of three.
   */
  onboardingSnapshot(userId: string): Promise<UserOnboardingSnapshot>;
}

export interface UserOnboardingSnapshot {
  /** When the user first finished /onboard. NULL = never. */
  onboardedAt: Date | null;
  /** Watchlist entries across all statuses — non-zero means they got going. */
  watchlistCount: number;
  /** Account creation timestamp — drives the "new user" window. */
  joinedAt: Date | null;
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
  /**
   * Genre slugs the user said they enjoy (typically picked during onboarding).
   * Used by the cold-start recommendation scorer until the watchlist has
   * enough signal of its own.
   */
  favoriteGenres: string[];
  /**
   * When true, the public profile (/u/[handle]) returns 404 to anyone but
   * the owner and the user's events are stripped from the global trending
   * feed.
   */
  isPrivate: boolean;
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
  favoriteGenres: [],
  isPrivate: false,
};
