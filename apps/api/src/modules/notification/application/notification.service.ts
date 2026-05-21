import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  CreateNotificationInput,
  NotificationRepositoryPort,
} from "../domain/ports/notification-repository.port";
import type { NotificationKind } from "../domain/entities/notification.entity";
import { PushService } from "@modules/push/application/push.service";
import { GetUserPreferencesUseCase } from "@modules/user/application/use-cases/get-user-preferences.use-case";
import type { UserPreferences } from "@modules/user/domain/ports/user-repository.port";
import { NOTIFICATION_REPOSITORY } from "./tokens";

/**
 * Internal facade used by other modules' event handlers to push notifications.
 * Not exposed over HTTP — only the read endpoints (list, mark-read) are.
 *
 * Enforces three filters before persisting:
 *  1. User preferences (in-app toggle per kind).
 *  2. Quiet hours (Europe/Paris) — drops in-app and push during the
 *     user-set window; the DB row is also skipped so we don't queue a
 *     "pip" the user explicitly muted.
 *  3. Failures are swallowed: a notification failing to persist must
 *     never roll back the originating action.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
    private readonly pushService: PushService,
    private readonly getPreferences: GetUserPreferencesUseCase,
  ) {}

  async push(input: CreateNotificationInput): Promise<void> {
    let prefs: UserPreferences;
    try {
      prefs = await this.getPreferences.execute({ userId: input.userId });
    } catch (err) {
      this.logger.warn(
        `Notification prefs lookup failed for ${input.userId}; proceeding with defaults: ${(err as Error).message}`,
      );
      prefs = {
        emailNewEpisodes: true,
        emailWeeklyRecap: true,
        emailReviewReply: false,
        emailNewFollower: false,
        inAppEpisodeAired: true,
        inAppRecommendation: true,
        inAppMention: true,
        quietFromHour: null,
        quietToHour: null,
      };
    }

    if (!this.kindAllowedByPrefs(input.kind, prefs)) return;
    if (this.isQuietNow(prefs)) return;

    try {
      await this.repo.create(input);
    } catch (err) {
      this.logger.warn(
        `Notification dropped for user ${input.userId} (${input.kind}): ${(err as Error).message}`,
      );
      return;
    }
    void this.pushService.pushToUser(input.userId, {
      title: input.title,
      body: input.excerpt ?? null,
      url: input.linkUrl ?? null,
      icon: input.coverUrl ?? null,
    });
  }

  private kindAllowedByPrefs(kind: NotificationKind, prefs: UserPreferences): boolean {
    switch (kind) {
      case "EPISODE_AIRED":
        return prefs.inAppEpisodeAired;
      case "REVIEW_REPLY":
        // Mention-style — uses the @mentions toggle since we don't have
        // a dedicated review-reply in-app toggle.
        return prefs.inAppMention;
      case "WEEKLY_RECAP":
      case "SYSTEM":
        // Always allowed in-app — these are low-frequency and important
        // (welcome, recap). Email side is gated separately by the cron
        // when it queries prefs for who to email.
        return true;
      default:
        return true;
    }
  }

  /**
   * Compares "now" in Europe/Paris with the user's quiet window. Returns
   * false when quiet hours are disabled (one or both nulls). Handles the
   * cross-midnight case (e.g. 22 → 8).
   */
  private isQuietNow(prefs: UserPreferences): boolean {
    if (prefs.quietFromHour == null || prefs.quietToHour == null) return false;
    const parisHour = currentParisHour();
    const { quietFromHour: from, quietToHour: to } = prefs;
    if (from === to) return false; // 24h-loop window is meaningless → ignore.
    if (from < to) return parisHour >= from && parisHour < to;
    // Cross-midnight: e.g. from=22, to=8 → [22..23] ∪ [0..7]
    return parisHour >= from || parisHour < to;
  }
}

function currentParisHour(): number {
  // Intl handles DST + offset; we just need the hour-of-day.
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  });
  // formatToParts is more robust than parseInt on the format string.
  const part = formatter.formatToParts(new Date()).find((p) => p.type === "hour");
  const hour = part ? Number(part.value) : new Date().getHours();
  return Number.isFinite(hour) ? hour : new Date().getHours();
}
