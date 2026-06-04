import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetUserAchievementsUseCase } from "./application/use-cases/get-user-achievements.use-case";
import { ACHIEVEMENT_REPOSITORY } from "./application/tokens";
import { PrismaAchievementRepository } from "./infrastructure/persistence/prisma-achievement.repository";
import { AchievementController } from "./infrastructure/http/achievement.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AchievementController],
  providers: [
    GetUserAchievementsUseCase,
    { provide: ACHIEVEMENT_REPOSITORY, useClass: PrismaAchievementRepository },
  ],
  exports: [ACHIEVEMENT_REPOSITORY],
})
export class AchievementModule {}
