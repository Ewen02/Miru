import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  REVIEW_COMMENTED_EVENT,
  type ReviewCommentedPayload,
} from "@shared/events/activity.events";
import { ReviewDetailView, ReviewRepositoryPort } from "../../domain/ports/review-repository.port";
import { REVIEW_REPOSITORY } from "../tokens";

export interface AddReviewCommentInput {
  reviewId: string;
  userId: string;
  body: string;
}

@Injectable()
export class AddReviewCommentUseCase implements UseCase<AddReviewCommentInput, ReviewDetailView> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repo: ReviewRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ reviewId, userId, body }: AddReviewCommentInput): Promise<ReviewDetailView> {
    const trimmed = body.trim();
    if (trimmed.length < 1) {
      throw new ValidationException("Le commentaire ne peut pas être vide.");
    }
    if (trimmed.length > 2000) {
      throw new ValidationException("Le commentaire ne peut pas dépasser 2000 caractères.");
    }

    const exists = await this.repo.reviewExists(reviewId);
    if (!exists) throw new NotFoundException("Review", reviewId);

    await this.repo.addComment(reviewId, userId, trimmed);

    const detail = await this.repo.findDetailById(reviewId);
    if (!detail) throw new NotFoundException("Review", reviewId);

    // S2-04: emit so the notification listener can push a REVIEW_REPLY
    // in-app notif + an email when emailReviewReply is enabled. The
    // notifier handles the self-reply skip — keep the producer simple.
    this.events.emit(REVIEW_COMMENTED_EVENT, {
      reviewId,
      commenterId: userId,
      recipientId: detail.author.id,
      body: trimmed,
    } satisfies ReviewCommentedPayload);

    return detail;
  }
}
