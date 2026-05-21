import { UnauthorizedException, ValidationException } from "@shared/domain/domain-exception";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { makeUserRepoMock } from "../../domain/__fixtures__/user-repo.mock";
import { GetUserYearInReviewUseCase } from "./get-user-year-in-review.use-case";

describe("GetUserYearInReviewUseCase", () => {
  let repo: jest.Mocked<UserRepositoryPort>;
  let useCase: GetUserYearInReviewUseCase;

  beforeEach(() => {
    repo = makeUserRepoMock();
    useCase = new GetUserYearInReviewUseCase(repo);
  });

  it("rejects an empty session userId", async () => {
    await expect(useCase.execute({ userId: "", year: 2026 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("rejects a non-integer year", async () => {
    await expect(
      useCase.execute({ userId: "u1", year: Number.NaN }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it("rejects a year before 2000", async () => {
    await expect(useCase.execute({ userId: "u1", year: 1999 })).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it("rejects a year in the future", async () => {
    const future = new Date().getFullYear() + 1;
    await expect(
      useCase.execute({ userId: "u1", year: future }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it("delegates to the repository for a valid year", async () => {
    const review = {
      year: 2026,
      completedCount: 0,
      hoursWatched: 0,
      moviesCount: 0,
      reviewCount: 0,
      previousYearCompletedCount: 0,
      months: [],
      topAnime: [],
      genres: [],
      studios: [],
    };
    repo.yearInReviewByUserId.mockResolvedValue(review);

    const result = await useCase.execute({ userId: "u1", year: 2026 });

    expect(repo.yearInReviewByUserId).toHaveBeenCalledWith("u1", 2026);
    expect(result).toBe(review);
  });
});
