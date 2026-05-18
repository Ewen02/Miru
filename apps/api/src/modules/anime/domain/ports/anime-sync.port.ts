import { AnimeEntity } from "../entities/anime.entity";

export interface StreamingEpisodeInput {
  number: number;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
}

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

/**
 * Port sortant — interface pour récupérer les données depuis une source externe.
 * Implémenté par l'adapter AniList dans l'infra.
 */
export interface AnimeSyncPort {
  fetchTrending(page: number, perPage: number): Promise<AnimeEntity[]>;
  fetchBySeason(
    season: MediaSeason,
    seasonYear: number,
    page: number,
    perPage: number,
  ): Promise<AnimeEntity[]>;
  fetchById(externalId: number): Promise<AnimeEntity | null>;
  searchByTitle(query: string): Promise<AnimeEntity[]>;
  fetchStreamingEpisodes(externalId: number): Promise<StreamingEpisodeInput[]>;
}
