import { Entity } from "@shared/domain/entity.base";
import { InvalidReviewRatingException } from "../exceptions/review.exceptions";

interface ReviewProps {
  userId: string;
  animeId: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewEntity extends Entity<ReviewProps> {
  get userId(): string {
    return this.props.userId;
  }
  get animeId(): string {
    return this.props.animeId;
  }
  get rating(): number {
    return this.props.rating;
  }
  get body(): string | null {
    return this.props.body;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  setRating(rating: number): void {
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      throw new InvalidReviewRatingException(rating);
    }
    this.props.rating = rating;
  }

  setBody(body: string | null): void {
    this.props.body = body?.trim() ? body.trim() : null;
  }

  toSnapshot(): Readonly<ReviewProps> & { id: string } {
    return { id: this._id, ...this.props };
  }

  static create(id: string, props: ReviewProps): ReviewEntity {
    if (!Number.isInteger(props.rating) || props.rating < 1 || props.rating > 10) {
      throw new InvalidReviewRatingException(props.rating);
    }
    return new ReviewEntity(id, props);
  }
}
