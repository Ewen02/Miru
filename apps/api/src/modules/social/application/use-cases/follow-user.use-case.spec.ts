import type { EventEmitter2 } from "@nestjs/event-emitter";
import { ValidationException } from "@shared/domain/domain-exception";
import { USER_FOLLOWED_EVENT } from "@shared/events/activity.events";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { FollowUserUseCase } from "./follow-user.use-case";

function makeFollowRepoMock(): jest.Mocked<FollowRepositoryPort> {
  return {
    follow: jest.fn(),
    unfollow: jest.fn(),
    isFollowing: jest.fn(),
    countFollowers: jest.fn(),
    countFollowing: jest.fn(),
    listFollowing: jest.fn(),
  };
}

describe("FollowUserUseCase", () => {
  let repo: jest.Mocked<FollowRepositoryPort>;
  let events: { emit: jest.Mock };
  let useCase: FollowUserUseCase;

  beforeEach(() => {
    repo = makeFollowRepoMock();
    events = { emit: jest.fn() };
    useCase = new FollowUserUseCase(repo, events as unknown as EventEmitter2);
  });

  it("rejects following yourself", async () => {
    await expect(useCase.execute({ followerId: "u1", targetId: "u1" })).rejects.toBeInstanceOf(
      ValidationException,
    );
    expect(repo.follow).not.toHaveBeenCalled();
  });

  it("follows and emits the followed event", async () => {
    await useCase.execute({ followerId: "u1", targetId: "u2" });
    expect(repo.follow).toHaveBeenCalledWith("u1", "u2");
    expect(events.emit).toHaveBeenCalledWith(USER_FOLLOWED_EVENT, {
      followerId: "u1",
      followingId: "u2",
    });
  });
});
