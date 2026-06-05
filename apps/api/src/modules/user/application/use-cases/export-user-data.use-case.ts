import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

/**
 * GDPR Article 20 export. Returns every row owned by the user in a flat,
 * JSON-serialisable structure. The shape is deliberately tied to the
 * Prisma model: it's documentation as much as a transport — a future
 * re-import path can read this back.
 *
 * Excludes:
 *  - Hashed credentials and 2FA secrets (security risk to export)
 *  - Sessions (transient, security risk)
 *  - Notifications already delivered (the user can re-derive them)
 *  - Push subscriptions (device-bound)
 *
 * Includes:
 *  - User profile + preferences
 *  - Watchlist + per-episode tracking
 *  - Reviews + comments (own only)
 *  - Lists + items + likes given
 *  - Achievements unlocked
 *  - Activity events (own)
 *  - Reports filed (without resolution comments by admins)
 */
@Injectable()
export class ExportUserDataUseCase
  implements UseCase<{ userId: string }, UserDataExport>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute({ userId }: { userId: string }): Promise<UserDataExport> {
    const exportedAt = new Date().toISOString();
    // Pull the persistence row directly — the domain entity doesn't expose
    // createdAt, and we want a guaranteed-fresh email/name pair on disk.
    const userRow = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!userRow) {
      throw new Error(`Cannot export — user ${userId} not found`);
    }
    const preferences = await this.users.preferencesByUserId(userId);

    const [
      watchlist,
      episodesWatched,
      reviews,
      reviewComments,
      lists,
      listLikesGiven,
      achievements,
      activityEvents,
      reportsFiled,
    ] = await Promise.all([
      this.prisma.watchlistEntry.findMany({
        where: { userId },
        include: { anime: { select: { slug: true, title: true } } },
      }),
      this.prisma.userEpisode.findMany({
        where: { userId },
        include: { episode: { select: { animeId: true, number: true } } },
      }),
      this.prisma.review.findMany({
        where: { userId },
        include: { anime: { select: { slug: true, title: true } } },
      }),
      this.prisma.reviewComment.findMany({
        where: { userId },
      }),
      this.prisma.list.findMany({
        where: { userId },
        include: { items: true },
      }),
      this.prisma.listLike.findMany({
        where: { userId },
        select: { listId: true, likedAt: true },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: { select: { code: true, name: true } } },
      }),
      this.prisma.activityEvent.findMany({
        where: { userId },
      }),
      this.prisma.report.findMany({
        where: { reporterId: userId },
        select: {
          id: true,
          targetKind: true,
          targetId: true,
          reason: true,
          details: true,
          resolved: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      schemaVersion: 1,
      exportedAt,
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        emailVerified: userRow.emailVerified,
        image: userRow.image,
        bio: userRow.bio,
        createdAt: userRow.createdAt.toISOString(),
        // proSince / role / 2FA flags intentionally omitted (security or
        // operational metadata, not user-authored content).
      },
      preferences,
      watchlist: watchlist.map((w) => ({
        animeSlug: w.anime.slug,
        animeTitle: w.anime.title,
        status: w.status,
        rating: w.rating,
        currentEpisode: w.currentEpisode,
        isFavorite: w.isFavorite,
        startedAt: w.startedAt?.toISOString() ?? null,
        completedAt: w.completedAt?.toISOString() ?? null,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })),
      episodesWatched: episodesWatched.map((u) => ({
        animeId: u.episode.animeId,
        episodeNumber: u.episode.number,
        watchedAt: u.watchedAt.toISOString(),
      })),
      reviews: reviews.map((r) => ({
        animeSlug: r.anime.slug,
        animeTitle: r.anime.title,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      reviewComments: reviewComments.map((c) => ({
        reviewId: c.reviewId,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
      })),
      lists: lists.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        slug: l.slug,
        isPublic: l.isPublic,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
        items: l.items.map((it) => ({
          animeId: it.animeId,
          order: it.order,
          note: it.note,
          addedAt: it.addedAt.toISOString(),
        })),
      })),
      listLikesGiven: listLikesGiven.map((l) => ({
        listId: l.listId,
        likedAt: l.likedAt.toISOString(),
      })),
      achievementsUnlocked: achievements.map((a) => ({
        code: a.achievement.code,
        name: a.achievement.name,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
      activityEvents: activityEvents.map((e) => ({
        kind: e.kind,
        createdAt: e.createdAt.toISOString(),
        animeId: e.animeId,
        listId: e.listId,
        achievementId: e.achievementId,
        meta: e.meta,
      })),
      reportsFiled: reportsFiled.map((r) => ({
        id: r.id,
        targetKind: r.targetKind,
        targetId: r.targetId,
        reason: r.reason,
        details: r.details,
        resolved: r.resolved,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}

// Output shape pinned and exported so the controller declares it on the
// response without re-deriving from the Prisma return types.
export interface UserDataExport {
  schemaVersion: 1;
  exportedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    bio: string | null;
    createdAt: string;
  };
  preferences: unknown;
  watchlist: Array<Record<string, unknown>>;
  episodesWatched: Array<Record<string, unknown>>;
  reviews: Array<Record<string, unknown>>;
  reviewComments: Array<Record<string, unknown>>;
  lists: Array<Record<string, unknown>>;
  listLikesGiven: Array<Record<string, unknown>>;
  achievementsUnlocked: Array<Record<string, unknown>>;
  activityEvents: Array<Record<string, unknown>>;
  reportsFiled: Array<Record<string, unknown>>;
}
