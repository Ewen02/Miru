import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ActivityEventView,
  ActivityRepositoryPort,
  RecordActivityInput,
} from "../../domain/ports/activity-repository.port";

const FEED_INCLUDE = {
  user: { select: { name: true } },
  anime: { select: { slug: true, title: true, coverUrl: true } },
  list: { select: { id: true, title: true } },
  achievement: { select: { code: true, name: true } },
} satisfies Prisma.ActivityEventInclude;

type FeedRow = Prisma.ActivityEventGetPayload<{ include: typeof FEED_INCLUDE }>;

@Injectable()
export class PrismaActivityRepository implements ActivityRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordActivityInput): Promise<void> {
    await this.prisma.activityEvent.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        animeId: input.animeId ?? null,
        listId: input.listId ?? null,
        achievementId: input.achievementId ?? null,
        meta: (input.meta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }

  async feedForUsers(userIds: string[], limit: number): Promise<ActivityEventView[]> {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.activityEvent.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: FEED_INCLUDE,
    });
    return rows.map((row) => this.toView(row));
  }

  async feedGlobal(limit: number): Promise<ActivityEventView[]> {
    const rows = await this.prisma.activityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: FEED_INCLUDE,
    });
    return rows.map((row) => this.toView(row));
  }

  private toView(row: FeedRow): ActivityEventView {
    return {
      id: row.id,
      userId: row.userId,
      actorName: row.user.name,
      kind: row.kind,
      createdAt: row.createdAt,
      anime: row.anime
        ? { slug: row.anime.slug, title: row.anime.title, coverUrl: row.anime.coverUrl }
        : null,
      list: row.list ? { id: row.list.id, title: row.list.title } : null,
      achievement: row.achievement
        ? { code: row.achievement.code, name: row.achievement.name }
        : null,
      meta:
        row.meta != null && typeof row.meta === "object" && !Array.isArray(row.meta)
          ? (row.meta as Record<string, unknown>)
          : null,
    };
  }
}
