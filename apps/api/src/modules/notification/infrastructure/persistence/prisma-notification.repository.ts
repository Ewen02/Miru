import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  NotificationEntity,
  NotificationKind,
} from "../../domain/entities/notification.entity";
import {
  CreateNotificationInput,
  NotificationRepositoryPort,
} from "../../domain/ports/notification-repository.port";

@Injectable()
export class PrismaNotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string, limit: number): Promise<NotificationEntity[]> {
    const records = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return records.map((r) => this.toEntity(r));
  }

  async unreadCountByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async create(input: CreateNotificationInput): Promise<NotificationEntity> {
    const record = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        title: input.title,
        excerpt: input.excerpt ?? null,
        linkUrl: input.linkUrl ?? null,
        coverUrl: input.coverUrl ?? null,
        payload: (input.payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    return this.toEntity(record);
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    // Scope by userId so a user can't mark someone else's notification as read.
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  private toEntity(record: {
    id: string;
    userId: string;
    kind: string;
    title: string;
    excerpt: string | null;
    linkUrl: string | null;
    coverUrl: string | null;
    payload: Prisma.JsonValue;
    readAt: Date | null;
    createdAt: Date;
  }): NotificationEntity {
    return NotificationEntity.create(record.id, {
      userId: record.userId,
      kind: record.kind as NotificationKind,
      title: record.title,
      excerpt: record.excerpt,
      linkUrl: record.linkUrl,
      coverUrl: record.coverUrl,
      payload: (record.payload as Record<string, unknown> | null) ?? null,
      readAt: record.readAt,
      createdAt: record.createdAt,
    });
  }
}
