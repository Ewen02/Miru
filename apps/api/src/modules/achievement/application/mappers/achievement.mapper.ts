import type { AchievementDto, UserAchievementsDto } from "@miru/types";
import {
  AchievementDef,
  UnlockedAchievement,
} from "../../domain/ports/achievement-repository.port";

export class AchievementMapper {
  static toDto(def: AchievementDef): AchievementDto {
    return {
      id: def.id,
      code: def.code,
      name: def.name,
      description: def.description,
      icon: def.icon,
      threshold: def.threshold,
    };
  }

  static toUserAchievementsDto(
    unlocked: UnlockedAchievement[],
    all: AchievementDef[],
  ): UserAchievementsDto {
    return {
      unlocked: unlocked.map((u) => ({
        ...AchievementMapper.toDto(u),
        unlockedAt: u.unlockedAt.toISOString(),
      })),
      all: all.map((a) => AchievementMapper.toDto(a)),
    };
  }
}
