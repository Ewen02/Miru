import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ReviewRepositoryPort,
  ReviewWithAuthor,
} from "../../domain/ports/review-repository.port";
import { REVIEW_REPOSITORY } from "../tokens";

@Injectable()
export class ListReviewsForAnimeUseCase implements UseCase<string, ReviewWithAuthor[]> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repo: ReviewRepositoryPort,
  ) {}

  async execute(animeId: string): Promise<ReviewWithAuthor[]> {
    return this.repo.listForAnime(animeId);
  }
}
