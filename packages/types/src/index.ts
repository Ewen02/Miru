// Enums remplacés par const objects + type unions — compatibles avec Node strip-only TS
// et avec les imports runtime depuis des sources non compilées.

export const AnimeStatus = {
  AIRING: "AIRING",
  FINISHED: "FINISHED",
  ANNOUNCED: "ANNOUNCED",
  HIATUS: "HIATUS",
} as const;
export type AnimeStatus = (typeof AnimeStatus)[keyof typeof AnimeStatus];

export const AnimeFormat = {
  TV: "TV",
  MOVIE: "MOVIE",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "SPECIAL",
} as const;
export type AnimeFormat = (typeof AnimeFormat)[keyof typeof AnimeFormat];

export const WatchStatus = {
  WATCHING: "WATCHING",
  COMPLETED: "COMPLETED",
  PLANNED: "PLANNED",
  DROPPED: "DROPPED",
  ON_HOLD: "ON_HOLD",
} as const;
export type WatchStatus = (typeof WatchStatus)[keyof typeof WatchStatus];

export const CharacterRole = {
  MAIN: "MAIN",
  SUPPORTING: "SUPPORTING",
  BACKGROUND: "BACKGROUND",
} as const;
export type CharacterRole = (typeof CharacterRole)[keyof typeof CharacterRole];

// Shared interfaces (used across apps, distinct from Prisma models)
export interface AnimeCard {
  id: string;
  slug: string;
  title: string;
  titleJp: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  accentHex: string | null;
  status: AnimeStatus;
  format: AnimeFormat;
  year: number | null;
  studioName: string | null;
  averageRating: number | null;
  genres: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface GenreCard {
  slug: string;
  name: string;
}

export interface GenreStats {
  totalAnimes: number;
  thisYearAnimes: number;
  averageRating: number | null;
}

export interface GenreDetail {
  slug: string;
  name: string;
  stats: GenreStats;
  animes: PaginatedResult<AnimeCard>;
}

export interface StudioStats {
  totalAnimes: number;
  averageRating: number | null;
  tvCount: number;
  movieCount: number;
}

export interface StudioDetail {
  slug: string;
  name: string;
  stats: StudioStats;
  animes: PaginatedResult<AnimeCard>;
}

export interface CharacterAppearance {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeYear: number | null;
  animeCoverUrl: string | null;
  animeEpisodeCount: number | null;
  role: string;
}

export interface CharacterVoiceCredit {
  voiceActorId: string;
  voiceActorName: string;
  appearances: number;
}

export interface CharacterDetail {
  id: string;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  appearances: CharacterAppearance[];
  voiceCredits: CharacterVoiceCredit[];
}

export interface VoiceActorRole {
  characterId: string;
  characterName: string;
  characterImageUrl: string | null;
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeCoverUrl: string | null;
  animeYear: number | null;
  role: string;
}

export interface VoiceActorStats {
  animeCount: number;
  roleCount: number;
}

export interface VoiceActorDetail {
  id: string;
  name: string;
  stats: VoiceActorStats;
  roles: VoiceActorRole[];
}

export interface ListSummaryDto {
  id: string;
  userId: string;
  ownerName: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  coverArtSeed: number | null;
  /** Up to 4 cover URLs from the first items, for the preview tile. */
  previewCovers: Array<string | null>;
  itemCount: number;
  likeCount: number;
  /** ISO string. */
  updatedAt: string;
}

export interface ListItemDto {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeYear: number | null;
  animeCoverUrl: string | null;
  animeAverageRating: number | null;
  order: number;
  note: string | null;
  /** ISO string. */
  addedAt: string;
}

export interface ListDetailDto {
  id: string;
  userId: string;
  ownerName: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  coverArtSeed: number | null;
  itemCount: number;
  likeCount: number;
  /** ISO string. */
  updatedAt: string;
  likedByViewer: boolean;
  ownedByViewer: boolean;
  items: ListItemDto[];
}

export type NotificationKind = "EPISODE_AIRED" | "REVIEW_REPLY" | "WEEKLY_RECAP" | "SYSTEM";

export interface NotificationItemDto {
  id: string;
  kind: NotificationKind;
  title: string;
  excerpt: string | null;
  linkUrl: string | null;
  coverUrl: string | null;
  /** ISO string or null when unread. */
  readAt: string | null;
  /** ISO string. */
  createdAt: string;
}

export interface NotificationsListDto {
  unreadCount: number;
  items: NotificationItemDto[];
}

export interface UserProfileStats {
  completedCount: number;
  hoursWatched: number;
  reviewCount: number;
  /** 10-bin histogram of Review.rating, index 0 = rating 1. */
  ratingHistogram: number[];
}

export interface UserProfileFavorite {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
}

export interface UserProfileReview {
  id: string;
  rating: number;
  body: string | null;
  /** ISO string. */
  createdAt: string;
  anime: { id: string; slug: string; title: string; coverUrl: string | null };
}

export interface CalendarEpisode {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  studioName: string | null;
  coverUrl: string | null;
  episodeCount: number | null;
  episodeNumber: number;
  episodeTitle: string | null;
  /** ISO string. */
  airedAt: string;
}

export interface CalendarWeek {
  /** ISO string, inclusive start. */
  from: string;
  /** ISO string, exclusive end. */
  to: string;
  episodes: CalendarEpisode[];
}

export interface UserLifetimeStats {
  completedCount: number;
  hoursWatched: number;
  moviesCount: number;
  reviewCount: number;
  /** Mean of published Review.rating, 1-10 scale. null when no reviews. */
  reviewAverageRating: number | null;
  watchlistTotal: number;
  watchlistPlanned: number;
  topGenre: { name: string; slug: string; count: number } | null;
  topStudio: { name: string; count: number } | null;
  /** ISO string — earliest watchlist entry creation date. */
  firstAddedAt: string | null;
  /** Current streak: consecutive days up to today with at least one watched ep. */
  currentStreakDays: number;
  /** Longest streak ever. */
  longestStreakDays: number;
}

export interface UserLifetime {
  /** ISO string. */
  joinedAt: string | null;
  stats: UserLifetimeStats;
}

export interface UserActiveSessionDto {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  /** ISO string. */
  createdAt: string;
  /** ISO string. */
  expiresAt: string;
  current: boolean;
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

export interface YearInReviewDto {
  year: number;
  completedCount: number;
  hoursWatched: number;
  moviesCount: number;
  reviewCount: number;
  /** Last year's completedCount for YoY growth. */
  previousYearCompletedCount: number;
  months: YearInReviewMonth[];
  topAnime: YearInReviewTopAnime[];
  genres: YearInReviewBreakdownRow[];
  studios: YearInReviewBreakdownRow[];
}

export interface UserProfile {
  id: string;
  handle: string;
  name: string;
  image: string | null;
  /** ISO string or null when join date is unknown. */
  joinedAt: string | null;
  stats: UserProfileStats;
  favorites: UserProfileFavorite[];
  reviews: UserProfileReview[];
}

export interface EpisodeItem {
  id: string;
  number: number;
  title: string | null;
  titleJp: string | null;
  titleRomaji: string | null;
  duration: number | null;
  airedAt: Date | null;
  filler: boolean;
  recap: boolean;
  thumbnail: string | null;
  url: string | null;
}

export interface AnimeDetail extends AnimeCard {
  titleEn: string | null;
  synopsis: string | null;
  episodeCount: number | null;
  episodes: EpisodeItem[];
  characters: CharacterCard[];
  relations: AnimeRelationCard[];
  platforms: PlatformLink[];
}

export interface PlatformLink {
  slug: string;
  name: string;
  iconUrl: string | null;
  color: string | null;
  url: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: CharacterRole;
  voiceActor: string | null;
  /** Local DB id of the voice actor — used to link to /people/[id]. */
  voiceActorId: string | null;
}

export type RelationType = "SEQUEL" | "PREQUEL" | "SIDE_STORY" | "SPIN_OFF";

export interface AnimeRelationCard {
  relationType: RelationType;
  title: string;
  coverUrl: string | null;
  format: string | null;
  year: number | null;
  /** Slug local si l'anime lié est en DB, null sinon (card non-cliquable). */
  slug: string | null;
}

export interface UserAnimeEntry {
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
}

export interface WatchlistEntry {
  userId: string;
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface WatchlistItem extends WatchlistEntry {
  anime: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    accentHex: string | null;
    episodeCount: number | null;
  };
}

export interface ReviewItem {
  id: string;
  userId: string;
  animeId: string;
  rating: number;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}
