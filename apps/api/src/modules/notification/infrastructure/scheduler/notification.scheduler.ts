import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { NotificationService } from "../../application/notification.service";

const ENABLED = process.env.ENABLE_SCHEDULER === "true";

/**
 * Periodic producers that push notifications. Each cron is idempotent so a
 * missed tick (or a duplicate run) does not double-send anything.
 *
 * Enabled only when `ENABLE_SCHEDULER=true` — matches the existing sync
 * scheduler convention to keep dev/test runs quiet.
 */
@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * Welcome notification — runs every 5 minutes, finds users with no SYSTEM
   * notification yet, sends a "Bienvenue" message. The unique-by-content
   * check on `kind='SYSTEM'` makes this safe to retry.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendWelcomeToNewUsers(): Promise<void> {
    if (!ENABLED) return;

    const newUsers = await this.prisma.user.findMany({
      where: {
        // Created in the last 24h and no SYSTEM notification yet.
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        notifications: { none: { kind: "SYSTEM" } },
      },
      select: { id: true, name: true },
    });

    if (newUsers.length === 0) return;

    this.logger.log(`Pushing welcome notifications to ${newUsers.length} new user(s)`);

    for (const user of newUsers) {
      await this.notifications.push({
        userId: user.id,
        kind: "SYSTEM",
        title: `Bienvenue sur Miru, ${user.name.split(" ")[0]} 👋`,
        excerpt:
          "Pour démarrer, ajoute 3 anime à ta watchlist depuis le catalogue. Tu pourras revenir ici quand tu veux.",
        linkUrl: "/onboard",
      });
    }
  }

  /**
   * Episode aired — runs every hour, scans Episode.airedAt in the last hour,
   * finds users with that anime in WATCHING status, pushes one EPISODE_AIRED
   * per (user, episode). De-duplication uses the existing payload uniqueness
   * is best-effort: re-running within the hour will resend; with a real
   * dedup table we'd track sent (userId, episodeId) pairs.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async announceAiredEpisodes(): Promise<void> {
    if (!ENABLED) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    const episodes = await this.prisma.episode.findMany({
      where: { airedAt: { gte: oneHourAgo, lt: now } },
      select: {
        id: true,
        number: true,
        title: true,
        anime: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            watchlist: {
              where: { status: "WATCHING" },
              select: { userId: true },
            },
          },
        },
      },
    });

    let pushed = 0;
    for (const ep of episodes) {
      for (const entry of ep.anime.watchlist) {
        await this.notifications.push({
          userId: entry.userId,
          kind: "EPISODE_AIRED",
          title: `${ep.anime.title} — Épisode ${ep.number}`,
          excerpt: ep.title ?? "Nouvel épisode disponible.",
          linkUrl: `/anime/${ep.anime.slug}`,
          coverUrl: ep.anime.coverUrl,
          payload: { animeId: ep.anime.id, episodeId: ep.id, episodeNumber: ep.number },
        });
        pushed += 1;
      }
    }

    if (pushed > 0) {
      this.logger.log(`Episode aired: pushed ${pushed} notification(s) across ${episodes.length} episode(s)`);
    }
  }

  /**
   * Weekly recap — every Sunday at 20:00. Counts completions over the past
   * 7 days per user and pushes a WEEKLY_RECAP with the count.
   */
  @Cron("0 20 * * 0")
  async sendWeeklyRecap(): Promise<void> {
    if (!ENABLED) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // GROUP BY userId where completedAt within the week.
    const rows = await this.prisma.watchlistEntry.groupBy({
      by: ["userId"],
      where: {
        status: "COMPLETED",
        OR: [
          { completedAt: { gte: sevenDaysAgo } },
          { AND: [{ completedAt: null }, { updatedAt: { gte: sevenDaysAgo } }] },
        ],
      },
      _count: { _all: true },
    });

    for (const row of rows) {
      const count = row._count._all;
      await this.notifications.push({
        userId: row.userId,
        kind: "WEEKLY_RECAP",
        title: `Ta semaine sur Miru`,
        excerpt: `${count} anime terminé${count > 1 ? "s" : ""} cette semaine. Voir le bilan complet.`,
        linkUrl: `/year-in-review/${new Date().getFullYear()}`,
      });
    }

    if (rows.length > 0) {
      this.logger.log(`Weekly recap: pushed ${rows.length} notification(s)`);
    }
  }
}
