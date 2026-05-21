import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { SubscribePushUseCase } from "./application/use-cases/subscribe-push.use-case";
import { UnsubscribePushUseCase } from "./application/use-cases/unsubscribe-push.use-case";
import { PushService } from "./application/push.service";
import { PUSH_SUBSCRIPTION_REPOSITORY, WEB_PUSH_SENDER } from "./application/tokens";
import { PrismaPushSubscriptionRepository } from "./infrastructure/persistence/prisma-push-subscription.repository";
import { WebPushAdapter } from "./infrastructure/external/web-push.adapter";
import { PushController } from "./infrastructure/http/push.controller";

@Module({
  imports: [PrismaModule],
  controllers: [PushController],
  providers: [
    SubscribePushUseCase,
    UnsubscribePushUseCase,
    PushService,
    { provide: PUSH_SUBSCRIPTION_REPOSITORY, useClass: PrismaPushSubscriptionRepository },
    { provide: WEB_PUSH_SENDER, useClass: WebPushAdapter },
  ],
  // PushService exported so NotificationService can fan out push payloads
  // alongside DB notification rows.
  exports: [PushService],
})
export class PushModule {}
