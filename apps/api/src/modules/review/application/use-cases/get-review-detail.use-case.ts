import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { ReviewDetailView, ReviewRepositoryPort } from "../../domain/ports/review-repository.port";
import { REVIEW_REPOSITORY } from "../tokens";

export interface GetReviewDetailInput {
  reviewId: string;
}

@Injectable()
export class GetReviewDetailUseCase implements UseCase<GetReviewDetailInput, ReviewDetailView> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repo: ReviewRepositoryPort,
  ) {}

  async execute({ reviewId }: GetReviewDetailInput): Promise<ReviewDetailView> {
    const detail = await this.repo.findDetailById(reviewId);
    if (!detail) throw new NotFoundException("Review", reviewId);
    return detail;
  }
}
