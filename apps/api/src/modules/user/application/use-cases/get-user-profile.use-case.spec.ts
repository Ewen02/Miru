import { NotFoundException } from "@shared/domain/domain-exception";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { makeUserRepoMock } from "../../domain/__fixtures__/user-repo.mock";
import { GetUserProfileUseCase } from "./get-user-profile.use-case";

describe("GetUserProfileUseCase", () => {
  let repo: jest.Mocked<UserRepositoryPort>;
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    repo = makeUserRepoMock();
    useCase = new GetUserProfileUseCase(repo);
  });

  it("throws 404 when the handle resolves to no user", async () => {
    repo.findByHandle.mockResolvedValue(null);
    await expect(useCase.execute({ handle: "ghost" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("loads profile stats, favorites and reviews in parallel for a known handle", async () => {
    const user = UserEntity.create("u1", {
      email: "lea@example.com",
      name: "Léa",
      emailVerified: true,
      image: null,
      twoFactorEnabled: false,
      bio: null,
    });
    repo.findByHandle.mockResolvedValue(user);
    repo.joinedAt.mockResolvedValue(new Date("2024-09-12T00:00:00Z"));
    repo.statsByUserId.mockResolvedValue({
      completedCount: 42,
      hoursWatched: 17,
      reviewCount: 5,
      ratingHistogram: [0, 0, 0, 0, 1, 0, 1, 2, 1, 0],
    });
    repo.favoritesByUserId.mockResolvedValue([]);
    repo.reviewsByUserId.mockResolvedValue([]);

    const result = await useCase.execute({ handle: "lea" });

    expect(repo.findByHandle).toHaveBeenCalledWith("lea");
    expect(repo.statsByUserId).toHaveBeenCalledWith("u1");
    expect(repo.favoritesByUserId).toHaveBeenCalledWith("u1", 5);
    expect(repo.reviewsByUserId).toHaveBeenCalledWith("u1", 3);
    expect(result.user).toBe(user);
    expect(result.stats.completedCount).toBe(42);
    expect(result.joinedAt).toEqual(new Date("2024-09-12T00:00:00Z"));
  });
});
