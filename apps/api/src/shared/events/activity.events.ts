/**
 * Cross-module domain events for the activity feed + achievements. Producers
 * (watchlist, review, list, social) emit these via EventEmitter2; the social
 * RecordActivityListener and the achievement UnlockOnActivityListener consume
 * them. Living in `shared/` keeps producers from importing a consumer module's
 * internals — the dependency rule is preserved.
 */

export const WATCHLIST_ADDED_EVENT = "watchlist.added";
export interface WatchlistAddedPayload {
  userId: string;
  animeId: string;
  /** True when the entry was created as COMPLETED (drives COMPLETED_ANIME). */
  completed: boolean;
}

export const WATCHLIST_COMPLETED_EVENT = "watchlist.completed";
export interface WatchlistCompletedPayload {
  userId: string;
  animeId: string;
}

export const REVIEW_UPSERTED_EVENT = "review.upserted";
export interface ReviewUpsertedPayload {
  userId: string;
  animeId: string;
  rating: number;
}

export const LIST_CREATED_EVENT = "list.created";
export interface ListCreatedPayload {
  userId: string;
  listId: string;
}

export const USER_FOLLOWED_EVENT = "social.followed";
export interface UserFollowedPayload {
  followerId: string;
  followingId: string;
}

export const ACHIEVEMENT_UNLOCKED_EVENT = "achievement.unlocked";
export interface AchievementUnlockedPayload {
  userId: string;
  code: string;
}

/**
 * A comment was posted on a Review. The notification module turns this
 * into a REVIEW_REPLY in-app notification + (opt-in) email.
 * `recipientId` is the original review author; `commenterId` triggered
 * the event — the listener silently skips when they're the same person
 * (no "you replied to yourself" notifications).
 */
export const REVIEW_COMMENTED_EVENT = "review.commented";
export interface ReviewCommentedPayload {
  reviewId: string;
  /** Who wrote the comment. */
  commenterId: string;
  /** The original review's author. May equal commenterId on self-reply. */
  recipientId: string;
  body: string;
}
