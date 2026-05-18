import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UseCase } from "@shared/domain/use-case.base";
import { randomId } from "@shared/utils/random-id";
import { ReviewEntity } from "../../domain/entities/review.entity";
import { ReviewRepositoryPort } from "../../domain/ports/review-repository.port";
import { REVIEW_REPOSITORY } from "../tokens";
import { REVIEW_CHANGED_EVENT, type ReviewChangedPayload } from "../events";

export interface UpsertReviewInput {
  userId: string;
  animeId: string;
  rating: number;
  body?: string | null;
}

@Injectable()
export class UpsertReviewUseCase implements UseCase<UpsertReviewInput, ReviewEntity> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repo: ReviewRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute(input: UpsertReviewInput): Promise<ReviewEntity> {
    const existing = await this.repo.findByUserAndAnime(input.userId, input.animeId);
    const now = new Date();

    const review = existing
      ? (() => {
          existing.setRating(input.rating);
          existing.setBody(input.body ?? null);
          return existing;
        })()
      : ReviewEntity.create(randomId(), {
          userId: input.userId,
          animeId: input.animeId,
          rating: input.rating,
          body: input.body?.trim() || null,
          createdAt: now,
          updatedAt: now,
        });

    await this.repo.save(review);

    const payload: ReviewChangedPayload = { animeId: input.animeId };
    this.events.emit(REVIEW_CHANGED_EVENT, payload);

    return review;
  }
}
