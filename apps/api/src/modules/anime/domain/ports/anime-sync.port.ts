import { AnimeEntity } from "../entities/anime.entity";

/**
 * Port sortant — interface pour récupérer les données depuis une source externe.
 * Implémenté par l'adapter AniList dans l'infra.
 */
export interface AnimeSyncPort {
  fetchTrending(page: number, perPage: number): Promise<AnimeEntity[]>;
  fetchById(externalId: number): Promise<AnimeEntity | null>;
  searchByTitle(query: string): Promise<AnimeEntity[]>;
}
