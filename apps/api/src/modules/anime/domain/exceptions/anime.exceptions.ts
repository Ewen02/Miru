import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";

export class AnimeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super("Anime", id);
  }
}

export class InvalidRatingException extends ValidationException {
  constructor(value: number) {
    super(`Rating must be between 0 and 10 (received ${value})`);
  }
}
