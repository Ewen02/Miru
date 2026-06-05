import { WatchStatus } from "@miru/types";
import { WatchlistEntryEntity } from "../entities/watchlist-entry.entity";

export interface WatchlistEntryWithAnime {
  entry: WatchlistEntryEntity;
  anime: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    accentHex: string | null;
    episodeCount: number | null;
  };
}

export interface WatchedEpisodeSummary {
  episodeId: string;
  episodeNumber: number;
  watchedAt: Date;
}

export interface WatchlistRepositoryPort {
  findOne(userId: string, animeId: string): Promise<WatchlistEntryEntity | null>;
  findByUser(userId: string, status?: WatchStatus): Promise<WatchlistEntryWithAnime[]>;
  save(entry: WatchlistEntryEntity): Promise<void>;
  remove(userId: string, animeId: string): Promise<void>;
  /**
   * Per-episode watch tracking.
   * `markEpisodeWatched` is idempotent: re-marking returns silently and keeps
   * the original `watchedAt`. `unmarkEpisodeWatched` is safe on missing rows.
   */
  markEpisodeWatched(userId: string, episodeId: string): Promise<void>;
  unmarkEpisodeWatched(userId: string, episodeId: string): Promise<void>;
  /**
   * Mark every episode number <= upToEpisode as watched for this anime in
   * one shot. Uses INSERT … ON CONFLICT DO NOTHING so re-running keeps the
   * original watchedAt timestamps. Also bumps the WatchlistEntry's
   * currentEpisode to upToEpisode (capped at episodeCount when known) so
   * the progress bar stays in sync.
   */
  markEpisodesUpTo(
    userId: string,
    animeId: string,
    upToEpisode: number,
  ): Promise<{ newlyMarked: number; currentEpisode: number }>;
  /** Watched episodes for a given anime, newest first. */
  listWatchedEpisodes(userId: string, animeId: string): Promise<WatchedEpisodeSummary[]>;
}
