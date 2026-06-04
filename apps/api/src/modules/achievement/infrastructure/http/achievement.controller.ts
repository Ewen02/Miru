import { Controller, Get, UseGuards } from "@nestjs/common";
import type { UserAchievementsDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { GetUserAchievementsUseCase } from "../../application/use-cases/get-user-achievements.use-case";
import { AchievementMapper } from "../../application/mappers/achievement.mapper";

@Controller("achievements")
export class AchievementController {
  constructor(private readonly getUserAchievements: GetUserAchievementsUseCase) {}

  @Get("me")
  @UseGuards(AuthRequiredGuard)
  async me(@CurrentUserId() userId: string): Promise<UserAchievementsDto> {
    const { unlocked, all } = await this.getUserAchievements.execute({ userId });
    return AchievementMapper.toUserAchievementsDto(unlocked, all);
  }
}
