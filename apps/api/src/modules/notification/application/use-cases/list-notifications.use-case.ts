import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { NotificationEntity } from "../../domain/entities/notification.entity";
import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { NOTIFICATION_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 30;

interface Input {
  userId: string;
  limit?: number;
}

interface Output {
  unreadCount: number;
  items: NotificationEntity[];
}

@Injectable()
export class ListNotificationsUseCase implements UseCase<Input, Output> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute({ userId, limit }: Input): Promise<Output> {
    const [items, unreadCount] = await Promise.all([
      this.repo.findByUserId(userId, limit ?? DEFAULT_LIMIT),
      this.repo.unreadCountByUserId(userId),
    ]);
    return { items, unreadCount };
  }
}
