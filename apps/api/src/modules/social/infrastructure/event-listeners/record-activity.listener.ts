import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ACTIVITY_REPOSITORY } from "../../application/tokens";
import { ActivityRepositoryPort } from "../../domain/ports/activity-repository.port";
import {
  ACHIEVEMENT_UNLOCKED_EVENT,
  LIST_CREATED_EVENT,
  REVIEW_UPSERTED_EVENT,
  WATCHLIST_ADDED_EVENT,
  WATCHLIST_COMPLETED_EVENT,
  type AchievementUnlockedPayload,
  type ListCreatedPayload,
  type ReviewUpsertedPayload,
  type WatchlistAddedPayload,
  type WatchlistCompletedPayload,
} from "@shared/events/activity.events";

/**
 * Records activity-feed entries from domain events emitted across modules.
 * The social module owns the feed; other modules only fire facts about their
 * own concern. ADDED_TO_WATCHLIST is suppressed when the entry was created
 * directly as completed (we record COMPLETED_ANIME instead, avoiding a double
 * entry).
 */
@Injectable()
export class RecordActivityListener {
  private readonly logger = new Logger(RecordActivityListener.name);

  constructor(
    @Inject(ACTIVITY_REPOSITORY) private readonly activity: ActivityRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(WATCHLIST_ADDED_EVENT)
  async onWatchlistAdded({ userId, animeId, completed }: WatchlistAddedPayload): Promise<void> {
    if (completed) return;
    await this.activity.record({ userId, kind: "ADDED_TO_WATCHLIST", animeId });
  }

  @OnEvent(WATCHLIST_COMPLETED_EVENT)
  async onWatchlistCompleted({ userId, animeId }: WatchlistCompletedPayload): Promise<void> {
    await this.activity.record({ userId, kind: "COMPLETED_ANIME", animeId });
  }

  @OnEvent(REVIEW_UPSERTED_EVENT)
  async onReview({ userId, animeId, rating }: ReviewUpsertedPayload): Promise<void> {
    await this.activity.record({ userId, kind: "RATED_ANIME", animeId, meta: { rating } });
  }

  @OnEvent(LIST_CREATED_EVENT)
  async onListCreated({ userId, listId }: ListCreatedPayload): Promise<void> {
    await this.activity.record({ userId, kind: "CREATED_LIST", listId });
  }

  @OnEvent(ACHIEVEMENT_UNLOCKED_EVENT)
  async onAchievementUnlocked({ userId, code }: AchievementUnlockedPayload): Promise<void> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!achievement) return;
    await this.activity.record({
      userId,
      kind: "UNLOCKED_ACHIEVEMENT",
      achievementId: achievement.id,
    });
  }
}
