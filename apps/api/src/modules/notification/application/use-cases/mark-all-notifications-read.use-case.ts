import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { NOTIFICATION_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

@Injectable()
export class MarkAllNotificationsReadUseCase implements UseCase<Input, { updated: number }> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute({ userId }: Input): Promise<{ updated: number }> {
    const updated = await this.repo.markAllRead(userId);
    return { updated };
  }
}
