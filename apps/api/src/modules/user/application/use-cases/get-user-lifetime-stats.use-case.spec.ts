import { UnauthorizedException } from "@shared/domain/domain-exception";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { makeUserRepoMock } from "../../domain/__fixtures__/user-repo.mock";
import { GetUserLifetimeStatsUseCase } from "./get-user-lifetime-stats.use-case";

describe("GetUserLifetimeStatsUseCase", () => {
  let repo: jest.Mocked<UserRepositoryPort>;
  let useCase: GetUserLifetimeStatsUseCase;

  beforeEach(() => {
    repo = makeUserRepoMock();
    useCase = new GetUserLifetimeStatsUseCase(repo);
  });

  it("rejects an empty session userId", async () => {
    await expect(useCase.execute({ userId: "" })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("loads stats and joinedAt for a valid session", async () => {
    repo.joinedAt.mockResolvedValue(new Date("2024-09-12T00:00:00Z"));
    repo.lifetimeStatsByUserId.mockResolvedValue({
      completedCount: 142,
      hoursWatched: 57,
      moviesCount: 18,
      reviewCount: 12,
      reviewAverageRating: 8.2,
      watchlistTotal: 280,
      watchlistPlanned: 60,
      topGenre: { name: "Drama", count: 45 },
      topStudio: { name: "MAPPA", count: 18 },
      firstAddedAt: new Date("2024-09-12T00:00:00Z"),
    });

    const result = await useCase.execute({ userId: "u1" });

    expect(repo.lifetimeStatsByUserId).toHaveBeenCalledWith("u1");
    expect(result.stats.completedCount).toBe(142);
    expect(result.joinedAt).toEqual(new Date("2024-09-12T00:00:00Z"));
  });
});
