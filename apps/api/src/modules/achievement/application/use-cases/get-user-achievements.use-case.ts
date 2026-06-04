import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  AchievementDef,
  AchievementRepositoryPort,
  UnlockedAchievement,
} from "../../domain/ports/achievement-repository.port";
import { ACHIEVEMENT_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

interface Output {
  unlocked: UnlockedAchievement[];
  all: AchievementDef[];
}

@Injectable()
export class GetUserAchievementsUseCase implements UseCase<Input, Output> {
  constructor(@Inject(ACHIEVEMENT_REPOSITORY) private readonly repo: AchievementRepositoryPort) {}

  async execute({ userId }: Input): Promise<Output> {
    const [unlocked, all] = await Promise.all([
      this.repo.listUnlocked(userId),
      this.repo.listAll(),
    ]);
    return { unlocked, all };
  }
}
