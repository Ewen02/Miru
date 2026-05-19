import { NotificationEntity, NotificationKind } from "../entities/notification.entity";

export interface CreateNotificationInput {
  userId: string;
  kind: NotificationKind;
  title: string;
  excerpt?: string | null;
  linkUrl?: string | null;
  coverUrl?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface NotificationRepositoryPort {
  /** Newest first. */
  findByUserId(userId: string, limit: number): Promise<NotificationEntity[]>;
  unreadCountByUserId(userId: string): Promise<number>;
  create(input: CreateNotificationInput): Promise<NotificationEntity>;
  markRead(notificationId: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<number>;
}
