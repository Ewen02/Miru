import { GenreEntity } from "../entities/genre.entity";

export interface GenreStats {
  /** Total anime carrying this genre (NSFW excluded). */
  totalAnimes: number;
  /** Subset of the above released this year (proxy for "this season"). */
  thisYearAnimes: number;
  /** Weighted mean of averageRating across all anime in the genre. */
  averageRating: number | null;
}

export interface GenreRepositoryPort {
  findAll(): Promise<GenreEntity[]>;
  findBySlug(slug: string): Promise<GenreEntity | null>;
  statsBySlug(slug: string): Promise<GenreStats>;
}
