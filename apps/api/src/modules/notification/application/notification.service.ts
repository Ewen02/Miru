import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  CreateNotificationInput,
  NotificationRepositoryPort,
} from "../domain/ports/notification-repository.port";
import { NOTIFICATION_REPOSITORY } from "./tokens";

/**
 * Internal facade used by other modules' event handlers to push notifications.
 * Not exposed over HTTP — only the read endpoints (list, mark-read) are.
 *
 * Errors are swallowed and logged: a notification failing to persist must
 * never roll back the originating action (review creation, episode sync…).
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort,
  ) {}

  async push(input: CreateNotificationInput): Promise<void> {
    try {
      await this.repo.create(input);
    } catch (err) {
      this.logger.warn(
        `Notification dropped for user ${input.userId} (${input.kind}): ${(err as Error).message}`,
      );
    }
  }
}
