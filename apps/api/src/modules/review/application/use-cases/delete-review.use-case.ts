import { Injectable, Inject } from "@nestjs/common";
import { ForbiddenException } from "@shared/domain/domain-exception";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UseCase } from "@shared/domain/use-case.base";
import { ReviewNotFoundException } from "../../domain/exceptions/review.exceptions";
import { ReviewRepositoryPort } from "../../domain/ports/review-repository.port";
import { REVIEW_REPOSITORY } from "../tokens";
import { REVIEW_CHANGED_EVENT, type ReviewChangedPayload } from "../events";

export interface DeleteReviewInput {
  reviewId: string;
  userId: string;
}

@Injectable()
export class DeleteReviewUseCase implements UseCase<DeleteReviewInput, void> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repo: ReviewRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ reviewId, userId }: DeleteReviewInput): Promise<void> {
    const review = await this.repo.findById(reviewId);
    if (!review) throw new ReviewNotFoundException(reviewId);
    if (review.userId !== userId) {
      throw new ForbiddenException("Cannot delete someone else's review");
    }

    await this.repo.remove(reviewId);

    const payload: ReviewChangedPayload = { animeId: review.animeId };
    this.events.emit(REVIEW_CHANGED_EVENT, payload);
  }
}
