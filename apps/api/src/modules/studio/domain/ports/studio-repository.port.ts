import { StudioEntity } from "../entities/studio.entity";

export interface StudioStats {
  totalAnimes: number;
  averageRating: number | null;
  tvCount: number;
  movieCount: number;
}

export interface StudioRepositoryPort {
  findBySlug(slug: string): Promise<StudioEntity | null>;
  statsBySlug(slug: string): Promise<StudioStats>;
}
