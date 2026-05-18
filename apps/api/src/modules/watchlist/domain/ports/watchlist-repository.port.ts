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

export interface WatchlistRepositoryPort {
  findOne(userId: string, animeId: string): Promise<WatchlistEntryEntity | null>;
  findByUser(userId: string, status?: WatchStatus): Promise<WatchlistEntryWithAnime[]>;
  save(entry: WatchlistEntryEntity): Promise<void>;
  remove(userId: string, animeId: string): Promise<void>;
}
