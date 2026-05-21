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
  /** Watched episodes for a given anime, newest first. */
  listWatchedEpisodes(userId: string, animeId: string): Promise<WatchedEpisodeSummary[]>;
}
