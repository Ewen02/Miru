import { RepositoryPort, PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeEntity } from "../entities/anime.entity";
import { EpisodeInput } from "./episode-sync.port";
import { AnimeStatus, AnimeFormat } from "@miru/types";

/**
 * Catalog sort options. Default is RECENCY (year DESC).
 *  - RATING        — averageRating DESC nulls last
 *  - POPULARITY    — reviewCount DESC (proxy for "the community talks about it")
 *  - RECENCY       — year DESC, then averageRating DESC
 *  - EPISODE_COUNT — episodeCount DESC nulls last
 */
export type AnimeSort = "RATING" | "POPULARITY" | "RECENCY" | "EPISODE_COUNT";

export interface AnimeFilters {
  status?: AnimeStatus;
  format?: AnimeFormat;
  genres?: string[];
  /** Single year (kept for the existing /seasons UI). */
  year?: number;
  /** Inclusive lower bound on year. */
  yearFrom?: number;
  /** Inclusive upper bound on year. */
  yearTo?: number;
  /** Inclusive lower bound on episodeCount. */
  episodesMin?: number;
  /** Inclusive upper bound on episodeCount. */
  episodesMax?: number;
  search?: string;
  /** Slug of a studio — single match (not array, studios are 1-to-many in DB). */
  studioSlug?: string;
  /** Streaming platform slug(s). Matches AnimeOnPlatform.platform.slug. */
  streamingPlatforms?: string[];
  /**
   * Source material codes (MANGA, LIGHT_NOVEL, ORIGINAL, …). Any-match.
   * Strings are passed through verbatim — the catalog DTO whitelists.
   */
  sources?: string[];
  sort?: AnimeSort;
}

export interface AnimeAccentPreview {
  slug: string;
  title: string;
  accentHex: string | null;
}

/**
 * Flat row for the airing calendar — denormalized for the API/UI layer so
 * we don't ship full anime entities for what is essentially a date+title list.
 */
export interface EpisodeAiringRow {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  studioName: string | null;
  coverUrl: string | null;
  episodeCount: number | null;
  episodeNumber: number;
  episodeTitle: string | null;
  airedAt: Date;
}

export interface AnimeRepositoryPort extends RepositoryPort<AnimeEntity> {
  findByFilters(
    filters: AnimeFilters,
    pagination: PaginatedQuery,
  ): Promise<PaginatedResult<AnimeEntity>>;
  findByAnilistId(anilistId: number): Promise<AnimeEntity | null>;
  findBySlug(slug: string): Promise<AnimeEntity | null>;
  /** Lookup minimal (3 colonnes) pour le Suspense accent de la fiche anime. */
  findAccentPreviewBySlug(slug: string): Promise<AnimeAccentPreview | null>;
  findTrending(limit: number): Promise<AnimeEntity[]>;
  findAllWithMalId(options?: { limit?: number; airingOnly?: boolean }): Promise<AnimeEntity[]>;
  findAllWithAnilistId(options?: { limit?: number; airingOnly?: boolean }): Promise<AnimeEntity[]>;
  /** Résout les slugs locaux pour une liste d'externalAnilistId. Retourne une map anilistId → slug. */
  findSlugsByAnilistIds(anilistIds: number[]): Promise<Map<number, string>>;
  saveEpisodes(animeId: string, episodes: EpisodeInput[]): Promise<void>;
  enrichEpisodes(
    animeId: string,
    updates: Array<{
      number: number;
      thumbnail: string | null;
      url: string | null;
      site: string | null;
    }>,
  ): Promise<number>;
  /**
   * Marks the anime as having failed its last sync attempt and schedules a
   * retry with exponential backoff (1h → 4h → 24h, capped at 5 attempts;
   * past that the row is abandoned by the retry cron).
   */
  markSyncFailed(animeId: string): Promise<void>;
  /**
   * Returns animes whose retry window has elapsed (`syncRetryAt <= now`),
   * up to `limit`. The caller should re-process each through the normal
   * import path; on success it must call `clearSyncRetry`.
   */
  findReadyForRetry(limit: number): Promise<AnimeEntity[]>;
  /** Resets the retry state after a successful sync. */
  clearSyncRetry(animeId: string): Promise<void>;
  /** Episodes airing in [from, to] for the airing calendar. NSFW excluded. */
  findAiringEpisodesBetween(from: Date, to: Date): Promise<EpisodeAiringRow[]>;
  /**
   * Personalized recommendations: scores each catalog anime by how much its
   * genre + studio overlap with what the user has marked WATCHING/COMPLETED.
   * Excludes anything already in their watchlist (any status). NSFW excluded.
   */
  findRecommendedForUser(userId: string, limit: number): Promise<AnimeEntity[]>;
}
