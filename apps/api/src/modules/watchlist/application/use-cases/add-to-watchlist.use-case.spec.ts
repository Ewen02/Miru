import { WatchStatus } from "@miru/types";
import { WatchlistEntryEntity } from "../../domain/entities/watchlist-entry.entity";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { AddToWatchlistUseCase } from "./add-to-watchlist.use-case";

function makeRepoMock(): jest.Mocked<WatchlistRepositoryPort> {
  return {
    findOne: jest.fn(),
    findByUser: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

describe("AddToWatchlistUseCase", () => {
  let repo: jest.Mocked<WatchlistRepositoryPort>;
  let useCase: AddToWatchlistUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new AddToWatchlistUseCase(repo);
  });

  it("creates a PLANNED entry by default when none exists", async () => {
    repo.findOne.mockResolvedValue(null);

    const entry = await useCase.execute({ userId: "u1", animeId: "a1" });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(entry.status).toBe(WatchStatus.PLANNED);
    expect(entry.startedAt).toBeNull();
    expect(entry.completedAt).toBeNull();
  });

  it("stamps startedAt when adding straight as WATCHING", async () => {
    repo.findOne.mockResolvedValue(null);

    const entry = await useCase.execute({
      userId: "u1",
      animeId: "a1",
      status: WatchStatus.WATCHING,
    });

    expect(entry.status).toBe(WatchStatus.WATCHING);
    expect(entry.startedAt).toBeInstanceOf(Date);
  });

  it("returns the existing entry without saving when one already exists", async () => {
    const existing = WatchlistEntryEntity.create({
      userId: "u1",
      animeId: "a1",
      status: WatchStatus.WATCHING,
      currentEpisode: 4,
      rating: 7,
      isFavorite: false,
      startedAt: new Date("2026-01-01"),
      completedAt: null,
    });
    repo.findOne.mockResolvedValue(existing);

    const entry = await useCase.execute({ userId: "u1", animeId: "a1" });

    expect(repo.save).not.toHaveBeenCalled();
    expect(entry).toBe(existing);
    expect(entry.currentEpisode).toBe(4);
  });
});
