import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListNotificationsUseCase } from "./application/use-cases/list-notifications.use-case";
import {
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from "./application/use-cases/mark-notification-read.use-case";
import { NotificationService } from "./application/notification.service";
import { NOTIFICATION_REPOSITORY } from "./application/tokens";
import { PrismaNotificationRepository } from "./infrastructure/persistence/prisma-notification.repository";
import { NotificationController } from "./infrastructure/http/notification.controller";

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    NotificationService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
  ],
  // NotificationService is exported so other modules can push notifications
  // from their event handlers without depending on the repository directly.
  exports: [NotificationService],
})
export class NotificationModule {}
