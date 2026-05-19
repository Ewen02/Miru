import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import type { NotificationsListDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { ListNotificationsUseCase } from "../../application/use-cases/list-notifications.use-case";
import {
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from "../../application/use-cases/mark-notification-read.use-case";

@Controller("notifications")
@UseGuards(AuthRequiredGuard)
export class NotificationController {
  constructor(
    private readonly listNotifications: ListNotificationsUseCase,
    private readonly markRead: MarkNotificationReadUseCase,
    private readonly markAllRead: MarkAllNotificationsReadUseCase,
  ) {}

  @Get()
  async list(@CurrentUserId() userId: string): Promise<NotificationsListDto> {
    const { items, unreadCount } = await this.listNotifications.execute({ userId });
    return {
      unreadCount,
      items: items.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        excerpt: n.excerpt,
        linkUrl: n.linkUrl,
        coverUrl: n.coverUrl,
        readAt: n.readAt ? n.readAt.toISOString() : null,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  @Post(":id/read")
  async readOne(
    @Param("id") id: string,
    @CurrentUserId() userId: string,
  ): Promise<{ ok: true }> {
    await this.markRead.execute({ userId, notificationId: id });
    return { ok: true };
  }

  @Post("read-all")
  async readAll(@CurrentUserId() userId: string): Promise<{ updated: number }> {
    return this.markAllRead.execute({ userId });
  }
}
