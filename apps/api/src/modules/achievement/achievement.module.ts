import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetUserAchievementsUseCase } from "./application/use-cases/get-user-achievements.use-case";
import { UnlockAchievementUseCase } from "./application/use-cases/unlock-achievement.use-case";
import { ACHIEVEMENT_REPOSITORY } from "./application/tokens";
import { PrismaAchievementRepository } from "./infrastructure/persistence/prisma-achievement.repository";
import { AchievementController } from "./infrastructure/http/achievement.controller";
import { UnlockOnActivityListener } from "./infrastructure/event-listeners/unlock-on-activity.listener";

@Module({
  imports: [PrismaModule],
  controllers: [AchievementController],
  providers: [
    GetUserAchievementsUseCase,
    UnlockAchievementUseCase,
    UnlockOnActivityListener,
    { provide: ACHIEVEMENT_REPOSITORY, useClass: PrismaAchievementRepository },
  ],
  exports: [ACHIEVEMENT_REPOSITORY],
})
export class AchievementModule {}
