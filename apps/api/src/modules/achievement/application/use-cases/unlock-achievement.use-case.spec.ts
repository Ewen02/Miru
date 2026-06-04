import type { EventEmitter2 } from "@nestjs/event-emitter";
import { AchievementRepositoryPort } from "../../domain/ports/achievement-repository.port";
import { ACHIEVEMENT_UNLOCKED_EVENT } from "@shared/events/activity.events";
import { UnlockAchievementUseCase } from "./unlock-achievement.use-case";

function makeRepoMock(): jest.Mocked<AchievementRepositoryPort> {
  return {
    listAll: jest.fn(),
    listUnlocked: jest.fn(),
    unlock: jest.fn(),
  };
}

describe("UnlockAchievementUseCase", () => {
  let repo: jest.Mocked<AchievementRepositoryPort>;
  let events: { emit: jest.Mock };
  let useCase: UnlockAchievementUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    events = { emit: jest.fn() };
    useCase = new UnlockAchievementUseCase(repo, events as unknown as EventEmitter2);
  });

  it("emits the unlocked event on a fresh unlock", async () => {
    repo.unlock.mockResolvedValue(true);
    const result = await useCase.execute({ userId: "u1", code: "first_review" });
    expect(result).toEqual({ unlocked: true });
    expect(events.emit).toHaveBeenCalledWith(ACHIEVEMENT_UNLOCKED_EVENT, {
      userId: "u1",
      code: "first_review",
    });
  });

  it("does not emit when already unlocked or unknown", async () => {
    repo.unlock.mockResolvedValue(false);
    const result = await useCase.execute({ userId: "u1", code: "first_review" });
    expect(result).toEqual({ unlocked: false });
    expect(events.emit).not.toHaveBeenCalled();
  });
});
