import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { MailService } from "@shared/mail/mail.service";
import { NotificationService } from "../../application/notification.service";

const ENABLED = process.env.ENABLE_SCHEDULER === "true";

/**
 * Periodic producers that push notifications. Each cron is idempotent so a
 * missed tick (or a duplicate run) does not double-send anything.
 *
 * Enabled only when `ENABLE_SCHEDULER=true` — matches the existing sync
 * scheduler convention to keep dev/test runs quiet.
 *
 * Sprint 2 — every produced notification also fans out email when:
 *  - The matching UserPreferences flag is true
 *  - And the corresponding NotificationDedup row didn't already record
 *    the same (user, key) — we share the same dedup table the in-app push
 *    uses, so opting into email never doubles up.
 */
@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly mail: MailService,
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
   * per (user, episode).
   *
   * QW-04 / S2-05: per-(user, episode) idempotency through NotificationDedup.
   * S2-02: also send email when emailNewEpisodes is enabled.
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
              select: {
                userId: true,
                user: {
                  select: {
                    email: true,
                    preferences: { select: { emailNewEpisodes: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    let pushed = 0;
    let skipped = 0;
    let emailed = 0;
    for (const ep of episodes) {
      for (const entry of ep.anime.watchlist) {
        const fresh = await this.claimDedup(entry.userId, "EPISODE_AIRED", `episode:${ep.id}`);
        if (!fresh) {
          skipped += 1;
          continue;
        }
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

        if (entry.user.preferences?.emailNewEpisodes && entry.user.email) {
          await this.mail
            .sendEpisodeAired({
              to: entry.user.email,
              animeTitle: ep.anime.title,
              animeSlug: ep.anime.slug,
              episodeNumber: ep.number,
              episodeTitle: ep.title,
              coverUrl: ep.anime.coverUrl,
            })
            .then(() => {
              emailed += 1;
            })
            .catch((err) => {
              // Mail failures must never block the in-app push that already
              // landed — log and continue.
              this.logger.warn(
                `Episode email failed for user=${entry.userId} episode=${ep.id}: ${(err as Error).message}`,
              );
            });
        }
      }
    }

    if (pushed > 0 || skipped > 0) {
      this.logger.log(
        `Episode aired: pushed ${pushed} in-app, sent ${emailed} email(s) across ${episodes.length} episode(s)` +
          (skipped > 0 ? ` — ${skipped} already-sent skipped` : ""),
      );
    }
  }

  /**
   * Weekly recap — every Sunday at 20:00. Counts completions + episodes
   * watched over the past 7 days per user and pushes a WEEKLY_RECAP plus
   * an email when emailWeeklyRecap is enabled.
   */
  @Cron("0 20 * * 0")
  async sendWeeklyRecap(): Promise<void> {
    if (!ENABLED) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const year = new Date().getFullYear();
    const weekKey = `week:${weekIsoKey(new Date())}`;

    // Aggregate completed counts and episodes-watched counts in parallel.
    const [completionRows, episodeRows] = await Promise.all([
      this.prisma.watchlistEntry.groupBy({
        by: ["userId"],
        where: {
          status: "COMPLETED",
          OR: [
            { completedAt: { gte: sevenDaysAgo } },
            { AND: [{ completedAt: null }, { updatedAt: { gte: sevenDaysAgo } }] },
          ],
        },
        _count: { _all: true },
      }),
      this.prisma.userEpisode.groupBy({
        by: ["userId"],
        where: { watchedAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
      }),
    ]);

    const completedByUser = new Map(
      completionRows.map((r) => [r.userId, r._count._all]),
    );
    const episodesByUser = new Map(episodeRows.map((r) => [r.userId, r._count._all]));
    const userIds = new Set<string>([...completedByUser.keys(), ...episodesByUser.keys()]);
    if (userIds.size === 0) return;

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...userIds] } },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: { select: { emailWeeklyRecap: true } },
      },
    });

    let pushed = 0;
    let emailed = 0;
    for (const user of users) {
      const completed = completedByUser.get(user.id) ?? 0;
      const episodes = episodesByUser.get(user.id) ?? 0;
      if (completed === 0 && episodes === 0) continue;

      const fresh = await this.claimDedup(user.id, "WEEKLY_RECAP", weekKey);
      if (!fresh) continue;

      await this.notifications.push({
        userId: user.id,
        kind: "WEEKLY_RECAP",
        title: "Ta semaine sur Miru",
        excerpt: completed > 0
          ? `${completed} anime terminé${completed > 1 ? "s" : ""} cette semaine. Voir le bilan complet.`
          : `${episodes} épisodes regardés cette semaine. Continue.`,
        linkUrl: `/year-in-review/${year}`,
      });
      pushed += 1;

      if (user.preferences?.emailWeeklyRecap && user.email) {
        await this.mail
          .sendWeeklyRecap({
            to: user.email,
            firstName: user.name.split(" ")[0],
            episodesWatched: episodes,
            animesCompleted: completed,
            year,
          })
          .then(() => {
            emailed += 1;
          })
          .catch((err) => {
            this.logger.warn(
              `Recap email failed for user=${user.id}: ${(err as Error).message}`,
            );
          });
      }
    }

    if (pushed > 0) {
      this.logger.log(
        `Weekly recap: pushed ${pushed} in-app, sent ${emailed} email(s)`,
      );
    }
  }

  /**
   * S2-08 — Day-3 nurture email. Daily check for users who joined exactly
   * 3 days ago (give-or-take a 24h window). Dedup key is the user id so
   * we send at most once per user even if the cron mis-fires.
   */
  @Cron("0 11 * * *")
  async sendDayThreeNurture(): Promise<void> {
    if (!ENABLED) return;

    const start = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const end = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const candidates = await this.prisma.user.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: {
        id: true,
        email: true,
        name: true,
        watchlist: { select: { animeId: true } },
      },
    });
    if (candidates.length === 0) return;

    let emailed = 0;
    for (const user of candidates) {
      const fresh = await this.claimDedup(user.id, "SYSTEM", "day3-nurture");
      if (!fresh) continue;
      if (!user.email) continue;
      await this.mail
        .sendDayThreeNurture({
          to: user.email,
          firstName: user.name.split(" ")[0],
          watchlistCount: user.watchlist.length,
        })
        .then(() => {
          emailed += 1;
        })
        .catch((err) => {
          this.logger.warn(
            `Day-3 email failed for user=${user.id}: ${(err as Error).message}`,
          );
        });
    }

    if (emailed > 0) {
      this.logger.log(`Day-3 nurture: sent ${emailed} email(s)`);
    }
  }

  /**
   * S2-06 — Quiet hours catch-up digest. Runs hourly; for each user whose
   * quiet window has just ended in the past hour, count unread
   * EPISODE_AIRED notifications received during that window and push one
   * digest summary.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendQuietHoursDigest(): Promise<void> {
    if (!ENABLED) return;

    // Hour of day in Europe/Paris that just elapsed.
    const justEndedHour = parisHour(new Date(Date.now() - 30 * 60 * 1000));
    const candidates = await this.prisma.userPreferences.findMany({
      where: { quietToHour: justEndedHour, quietFromHour: { not: null } },
      select: { userId: true },
    });
    if (candidates.length === 0) return;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let pushed = 0;
    for (const c of candidates) {
      const count = await this.prisma.notification.count({
        where: {
          userId: c.userId,
          kind: "EPISODE_AIRED",
          createdAt: { gte: since },
          readAt: null,
        },
      });
      if (count < 2) continue;
      const fresh = await this.claimDedup(c.userId, "SYSTEM", `quiet-digest:${dayKey()}`);
      if (!fresh) continue;
      await this.notifications.push({
        userId: c.userId,
        kind: "SYSTEM",
        title: `Tu as ${count} nouveaux épisodes`,
        excerpt: "Le résumé de ta période calme.",
        linkUrl: "/notifications",
      });
      pushed += 1;
    }
    if (pushed > 0) this.logger.log(`Quiet-hours digest: pushed ${pushed} summary push`);
  }

  /**
   * Inserts a dedup row keyed by (userId, kind, dedupKey). Returns true if
   * the insert won the race (first time we see this combination) — caller
   * proceeds to actually push the notification. Returns false on conflict —
   * caller skips.
   *
   * createMany skipDuplicates is the only Prisma primitive that lets us
   * detect "first insert vs already-existed" without a SELECT round-trip,
   * so it's the cheapest path to idempotency.
   */
  private async claimDedup(userId: string, kind: string, dedupKey: string): Promise<boolean> {
    const inserted = await this.prisma.notificationDedup.createMany({
      data: [{ userId, kind, dedupKey }],
      skipDuplicates: true,
    });
    return inserted.count > 0;
  }
}

function parisHour(at: Date): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    hour12: false,
  });
  return Number(fmt.format(at));
}

function dayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** ISO week label, used as a dedup key for the Sunday recap. */
function weekIsoKey(d: Date): string {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
