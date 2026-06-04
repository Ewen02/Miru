import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UseCase } from "@shared/domain/use-case.base";
import { AchievementRepositoryPort } from "../../domain/ports/achievement-repository.port";
import { ACHIEVEMENT_REPOSITORY } from "../tokens";
import {
  ACHIEVEMENT_UNLOCKED_EVENT,
  type AchievementUnlockedPayload,
} from "@shared/events/activity.events";

interface Input {
  userId: string;
  code: string;
}

interface Output {
  /** True when the badge was newly unlocked (false if unknown or already owned). */
  unlocked: boolean;
}

/**
 * Unlocks a single achievement by code (idempotent). On a fresh unlock it
 * emits ACHIEVEMENT_UNLOCKED_EVENT so the activity feed can record it.
 */
@Injectable()
export class UnlockAchievementUseCase implements UseCase<Input, Output> {
  constructor(
    @Inject(ACHIEVEMENT_REPOSITORY) private readonly repo: AchievementRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ userId, code }: Input): Promise<Output> {
    const unlocked = await this.repo.unlock(userId, code);
    if (unlocked) {
      const payload: AchievementUnlockedPayload = { userId, code };
      this.events.emit(ACHIEVEMENT_UNLOCKED_EVENT, payload);
    }
    return { unlocked };
  }
}
