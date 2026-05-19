import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { NOTIFICATION_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  notificationId: string;
}

@Injectable()
export class MarkNotificationReadUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute({ userId, notificationId }: Input): Promise<void> {
    await this.repo.markRead(notificationId, userId);
  }
}

interface MarkAllInput {
  userId: string;
}

@Injectable()
export class MarkAllNotificationsReadUseCase implements UseCase<MarkAllInput, { updated: number }> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute({ userId }: MarkAllInput): Promise<{ updated: number }> {
    const updated = await this.repo.markAllRead(userId);
    return { updated };
  }
}
