import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { FollowUserUseCase } from "./application/use-cases/follow-user.use-case";
import { UnfollowUserUseCase } from "./application/use-cases/unfollow-user.use-case";
import { GetFollowStatsUseCase } from "./application/use-cases/get-follow-stats.use-case";
import { GetActivityFeedUseCase } from "./application/use-cases/get-activity-feed.use-case";
import { ACTIVITY_REPOSITORY, FOLLOW_REPOSITORY } from "./application/tokens";
import { PrismaFollowRepository } from "./infrastructure/persistence/prisma-follow.repository";
import { PrismaActivityRepository } from "./infrastructure/persistence/prisma-activity.repository";
import { SocialController } from "./infrastructure/http/social.controller";

@Module({
  imports: [PrismaModule],
  controllers: [SocialController],
  providers: [
    FollowUserUseCase,
    UnfollowUserUseCase,
    GetFollowStatsUseCase,
    GetActivityFeedUseCase,
    { provide: FOLLOW_REPOSITORY, useClass: PrismaFollowRepository },
    { provide: ACTIVITY_REPOSITORY, useClass: PrismaActivityRepository },
  ],
  exports: [FOLLOW_REPOSITORY, ACTIVITY_REPOSITORY],
})
export class SocialModule {}
