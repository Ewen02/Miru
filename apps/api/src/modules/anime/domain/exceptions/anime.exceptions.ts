import { NotFoundException } from "@shared/domain/domain-exception";

export class AnimeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super("Anime", id);
  }
}
