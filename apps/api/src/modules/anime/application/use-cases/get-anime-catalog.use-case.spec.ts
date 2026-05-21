import { AnimeStatus, AnimeFormat } from "@miru/types";
import { AnimeRepositoryPort } from "../../domain/ports/anime-repository.port";
import { makeAnimeEntity } from "../../domain/entities/__fixtures__/anime.fixture";
import { GetAnimeCatalogUseCase } from "./get-anime-catalog.use-case";

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

describe("GetAnimeCatalogUseCase", () => {
  let repo: jest.Mocked<AnimeRepositoryPort>;
  let useCase: GetAnimeCatalogUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new GetAnimeCatalogUseCase(repo);
  });

  it("delegates filters and pagination to the repository", async () => {
    const entity = makeAnimeEntity();
    repo.findByFilters.mockResolvedValue({
      data: [entity],
      total: 1,
      page: 1,
      pageSize: 20,
      hasNext: false,
    });

    const result = await useCase.execute({
      filters: { status: AnimeStatus.AIRING, format: AnimeFormat.TV },
      page: 1,
      pageSize: 20,
    });

    expect(repo.findByFilters).toHaveBeenCalledWith(
      { status: AnimeStatus.AIRING, format: AnimeFormat.TV },
      { page: 1, pageSize: 20 },
    );
    expect(result.data).toEqual([entity]);
    expect(result.total).toBe(1);
    expect(result.hasNext).toBe(false);
  });

  it("returns an empty page when the repository has no matches", async () => {
    repo.findByFilters.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNext: false,
    });

    const result = await useCase.execute({ filters: {}, page: 1, pageSize: 20 });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
