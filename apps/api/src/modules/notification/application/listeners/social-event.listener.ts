import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { MailService } from "@shared/mail/mail.service";
import {
  ACHIEVEMENT_UNLOCKED_EVENT,
  REVIEW_COMMENTED_EVENT,
  USER_FOLLOWED_EVENT,
  type AchievementUnlockedPayload,
  type ReviewCommentedPayload,
  type UserFollowedPayload,
} from "@shared/events/activity.events";
import { NotificationService } from "../notification.service";

/**
 * Translates cross-module events into in-app notifications and (opt-in)
 * emails. Lives in the notification module so producers stay event-only —
 * they never know who consumes their event.
 *
 *  - REVIEW_COMMENTED → REVIEW_REPLY notif + emailReviewReply email
 *  - ACHIEVEMENT_UNLOCKED → ACHIEVEMENT_UNLOCKED notif (in-app only)
 *  - USER_FOLLOWED → NEW_FOLLOWER notif + emailNewFollower email
 *
 * Best-effort throughout: failures are logged but never bubble. The user-
 * facing action that produced the event already succeeded.
 */
@Injectable()
export class SocialEventListener {
  private readonly logger = new Logger(SocialEventListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notifications: NotificationService,
  ) {}

  @OnEvent(REVIEW_COMMENTED_EVENT, { async: true, suppressErrors: true })
  async onReviewCommented(payload: ReviewCommentedPayload): Promise<void> {
    // Never notify a user about their own reply to their own review.
    if (payload.commenterId === payload.recipientId) return;

    const [review, commenter, recipient] = await Promise.all([
      this.prisma.review.findUnique({
        where: { id: payload.reviewId },
        select: { anime: { select: { slug: true, title: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: payload.commenterId },
        select: { name: true },
      }),
      this.prisma.user.findUnique({
        where: { id: payload.recipientId },
        select: {
          email: true,
          preferences: { select: { emailReviewReply: true } },
        },
      }),
    ]);
    if (!review || !commenter) return;

    const excerpt = payload.body.length > 200 ? payload.body.slice(0, 197) + "…" : payload.body;
    await this.notifications.push({
      userId: payload.recipientId,
      kind: "REVIEW_REPLY",
      title: `${commenter.name} a répondu à ton avis`,
      excerpt,
      linkUrl: `/reviews/${payload.reviewId}`,
      payload: { reviewId: payload.reviewId, commenterId: payload.commenterId },
    });

    if (recipient?.preferences?.emailReviewReply && recipient.email) {
      await this.mail
        .sendReviewReply({
          to: recipient.email,
          replierName: commenter.name,
          animeTitle: review.anime.title,
          excerpt,
          reviewId: payload.reviewId,
        })
        .catch((err) => {
          this.logger.warn(
            `Review reply email failed for user=${payload.recipientId}: ${(err as Error).message}`,
          );
        });
    }
  }

  @OnEvent(ACHIEVEMENT_UNLOCKED_EVENT, { async: true, suppressErrors: true })
  async onAchievementUnlocked(payload: AchievementUnlockedPayload): Promise<void> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: payload.code },
      select: { name: true, description: true, icon: true },
    });
    if (!achievement) return;

    await this.notifications.push({
      userId: payload.userId,
      kind: "ACHIEVEMENT_UNLOCKED",
      title: `Badge débloqué — ${achievement.name}`,
      excerpt: achievement.description,
      linkUrl: "/achievements",
      payload: { code: payload.code, icon: achievement.icon },
    });
  }

  @OnEvent(USER_FOLLOWED_EVENT, { async: true, suppressErrors: true })
  async onUserFollowed(payload: UserFollowedPayload): Promise<void> {
    const [follower, recipient] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: payload.followerId },
        select: { name: true },
      }),
      this.prisma.user.findUnique({
        where: { id: payload.followingId },
        select: {
          email: true,
          preferences: { select: { emailNewFollower: true } },
        },
      }),
    ]);
    if (!follower) return;

    await this.notifications.push({
      userId: payload.followingId,
      kind: "NEW_FOLLOWER",
      title: `${follower.name} te suit maintenant`,
      excerpt: null,
      linkUrl: `/u/${encodeURIComponent(follower.name)}`,
      payload: { followerId: payload.followerId },
    });

    // No dedicated email template for new follower yet — only the in-app
    // notif fires. The emailNewFollower toggle stays in prefs for forward
    // compatibility; flipping it has no effect until a template ships.
    if (recipient?.preferences?.emailNewFollower) {
      this.logger.debug(
        `Skipped email for NEW_FOLLOWER user=${payload.followingId} (template TBD)`,
      );
    }
  }
}
