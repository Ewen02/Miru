import { ReviewEntity } from "../entities/review.entity";

export interface ReviewWithAuthor {
  review: ReviewEntity;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface AnimeReviewStats {
  averageRating: number | null;
  count: number;
}

export interface ReviewRepositoryPort {
  findById(id: string): Promise<ReviewEntity | null>;
  findByUserAndAnime(userId: string, animeId: string): Promise<ReviewEntity | null>;
  listForAnime(animeId: string): Promise<ReviewWithAuthor[]>;
  save(review: ReviewEntity): Promise<void>;
  remove(id: string): Promise<void>;
  /** Computes average + count for one anime so we can refresh Anime.averageRating. */
  statsForAnime(animeId: string): Promise<AnimeReviewStats>;
}
