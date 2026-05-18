import { RepositoryPort, PaginatedResult, PaginatedQuery } from "@shared/domain/repository.port";
import { AnimeEntity } from "../entities/anime.entity";
import { EpisodeInput } from "./episode-sync.port";
import { AnimeStatus, AnimeFormat } from "@miru/types";

export interface AnimeFilters {
  status?: AnimeStatus;
  format?: AnimeFormat;
  genres?: string[];
  year?: number;
  search?: string;
}

export interface AnimeAccentPreview {
  slug: string;
  title: string;
  accentHex: string | null;
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
}
