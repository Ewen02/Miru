import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UnlockAchievementUseCase } from "../../application/use-cases/unlock-achievement.use-case";
import {
  LIST_CREATED_EVENT,
  REVIEW_UPSERTED_EVENT,
  USER_FOLLOWED_EVENT,
  WATCHLIST_ADDED_EVENT,
  WATCHLIST_COMPLETED_EVENT,
  type ListCreatedPayload,
  type ReviewUpsertedPayload,
  type UserFollowedPayload,
  type WatchlistAddedPayload,
  type WatchlistCompletedPayload,
} from "@shared/events/activity.events";

/**
 * Maps domain events to achievement unlocks. Milestone badges (first_*) unlock
 * on the first occurrence (the unlock use case is idempotent). Count badges
 * (completed_10/100) check the live completed count when an anime is completed.
 *
 * Reading the watchlist count via Prisma here is acceptable — this is the
 * infrastructure layer and event listeners are cross-cutting glue.
 */
@Injectable()
export class UnlockOnActivityListener {
  private readonly logger = new Logger(UnlockOnActivityListener.name);

  constructor(
    private readonly unlock: UnlockAchievementUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(WATCHLIST_ADDED_EVENT)
  async onWatchlistAdded({ userId }: WatchlistAddedPayload): Promise<void> {
    await this.unlock.execute({ userId, code: "first_watchlist" });
  }

  @OnEvent(WATCHLIST_COMPLETED_EVENT)
  async onWatchlistCompleted({ userId }: WatchlistCompletedPayload): Promise<void> {
    const completed = await this.prisma.watchlistEntry.count({
      where: { userId, status: "COMPLETED" },
    });
    if (completed >= 100) await this.unlock.execute({ userId, code: "completed_100" });
    if (completed >= 10) await this.unlock.execute({ userId, code: "completed_10" });
  }

  @OnEvent(REVIEW_UPSERTED_EVENT)
  async onReview({ userId }: ReviewUpsertedPayload): Promise<void> {
    await this.unlock.execute({ userId, code: "first_review" });
  }

  @OnEvent(LIST_CREATED_EVENT)
  async onListCreated({ userId }: ListCreatedPayload): Promise<void> {
    await this.unlock.execute({ userId, code: "first_list" });
  }

  @OnEvent(USER_FOLLOWED_EVENT)
  async onFollowed({ followerId }: UserFollowedPayload): Promise<void> {
    await this.unlock.execute({ userId: followerId, code: "first_follow" });
  }
}
