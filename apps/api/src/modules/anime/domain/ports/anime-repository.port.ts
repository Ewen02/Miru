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

export interface AnimeRepositoryPort extends RepositoryPort<AnimeEntity> {
  findByFilters(
    filters: AnimeFilters,
    pagination: PaginatedQuery,
  ): Promise<PaginatedResult<AnimeEntity>>;
  findByAnilistId(anilistId: number): Promise<AnimeEntity | null>;
  findBySlug(slug: string): Promise<AnimeEntity | null>;
  findTrending(limit: number): Promise<AnimeEntity[]>;
  findAllWithMalId(options?: { limit?: number; airingOnly?: boolean }): Promise<AnimeEntity[]>;
  saveEpisodes(animeId: string, episodes: EpisodeInput[]): Promise<void>;
}
