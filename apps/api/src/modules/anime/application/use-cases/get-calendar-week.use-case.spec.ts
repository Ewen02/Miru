import { AnimeRepositoryPort, EpisodeAiringRow } from "../../domain/ports/anime-repository.port";
import { GetCalendarWeekUseCase } from "./get-calendar-week.use-case";

function makeRepoMock(): jest.Mocked<AnimeRepositoryPort> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findAccentPreviewBySlug: jest.fn(),
    findByAnilistId: jest.fn(),
    findByFilters: jest.fn(),
    findAllWithMalId: jest.fn(),
    findAllWithAnilistId: jest.fn(),
    findTrending: jest.fn(),
    findSlugsByAnilistIds: jest.fn(),
    saveEpisodes: jest.fn(),
    enrichEpisodes: jest.fn(),
    save: jest.fn(),
    markSyncFailed: jest.fn(),
    findAiringEpisodesBetween: jest.fn(),
    findRecommendedForUser: jest.fn(),
    delete: jest.fn(),
  };
}

function makeRow(overrides: Partial<EpisodeAiringRow> = {}): EpisodeAiringRow {
  return {
    animeId: "anime-1",
    animeSlug: "frieren",
    animeTitle: "Frieren",
    studioName: "Madhouse",
    coverUrl: null,
    episodeCount: 28,
    episodeNumber: 1,
    episodeTitle: "The Journey's End",
    airedAt: new Date("2026-05-12T09:00:00Z"),
    ...overrides,
  };
}

describe("GetCalendarWeekUseCase", () => {
  let repo: jest.Mocked<AnimeRepositoryPort>;
  let useCase: GetCalendarWeekUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new GetCalendarWeekUseCase(repo);
  });

  it("delegates the [from, to) window to the repository", async () => {
    const from = new Date("2026-05-12T00:00:00Z");
    const to = new Date("2026-05-19T00:00:00Z");
    repo.findAiringEpisodesBetween.mockResolvedValue([makeRow()]);

    const output = await useCase.execute({ from, to });

    expect(repo.findAiringEpisodesBetween).toHaveBeenCalledWith(from, to);
    expect(output.from).toBe(from.toISOString());
    expect(output.to).toBe(to.toISOString());
    expect(output.episodes).toHaveLength(1);
  });

  it("returns an empty list when no episodes air in the window", async () => {
    repo.findAiringEpisodesBetween.mockResolvedValue([]);

    const output = await useCase.execute({
      from: new Date("2026-05-12T00:00:00Z"),
      to: new Date("2026-05-19T00:00:00Z"),
    });

    expect(output.episodes).toEqual([]);
  });
});
