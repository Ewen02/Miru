import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";

export class ReviewNotFoundException extends NotFoundException {
  constructor(id: string) {
    super("Review", id);
  }
}

export class InvalidReviewRatingException extends ValidationException {
  constructor(value: number) {
    super(`Review rating must be an integer between 1 and 10 (received ${value})`);
  }
}
