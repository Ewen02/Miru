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

export interface ReviewDetailView {
  id: string;
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  comments: {
    id: string;
    body: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
}

export interface ReviewRepositoryPort {
  findById(id: string): Promise<ReviewEntity | null>;
  findByUserAndAnime(userId: string, animeId: string): Promise<ReviewEntity | null>;
  listForAnime(animeId: string): Promise<ReviewWithAuthor[]>;
  save(review: ReviewEntity): Promise<void>;
  remove(id: string): Promise<void>;
  /** Computes average + count for one anime so we can refresh Anime.averageRating. */
  statsForAnime(animeId: string): Promise<AnimeReviewStats>;
  /** Joins anime (slug, title) + author + comments (with their authors, oldest first). */
  findDetailById(reviewId: string): Promise<ReviewDetailView | null>;
  addComment(reviewId: string, userId: string, body: string): Promise<void>;
  reviewExists(reviewId: string): Promise<boolean>;
}
