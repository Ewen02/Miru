import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { PushModule } from "@modules/push/push.module";
import { ListNotificationsUseCase } from "./application/use-cases/list-notifications.use-case";
import { MarkNotificationReadUseCase } from "./application/use-cases/mark-notification-read.use-case";
import { MarkAllNotificationsReadUseCase } from "./application/use-cases/mark-all-notifications-read.use-case";
import { NotificationService } from "./application/notification.service";
import { NOTIFICATION_REPOSITORY } from "./application/tokens";
import { PrismaNotificationRepository } from "./infrastructure/persistence/prisma-notification.repository";
import { NotificationController } from "./infrastructure/http/notification.controller";
import { NotificationScheduler } from "./infrastructure/scheduler/notification.scheduler";

@Module({
  imports: [PrismaModule, PushModule],
  controllers: [NotificationController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    NotificationService,
    NotificationScheduler,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
  ],
  // NotificationService is exported so other modules can push notifications
  // from their event handlers without depending on the repository directly.
  exports: [NotificationService],
})
export class NotificationModule {}
