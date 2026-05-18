import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { AnimeSyncPort } from "@modules/anime/domain/ports/anime-sync.port";
import { makeAnimeEntity } from "@modules/anime/domain/entities/__fixtures__/anime.fixture";
import { ImportTrendingUseCase } from "./import-trending.use-case";

function makeSyncMock(): jest.Mocked<AnimeSyncPort> {
  return {
    fetchTrending: jest.fn(),
    fetchBySeason: jest.fn(),
    fetchById: jest.fn(),
    searchByTitle: jest.fn(),
    fetchStreamingEpisodes: jest.fn(),
  };
}

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
    delete: jest.fn(),
  };
}

describe("ImportTrendingUseCase", () => {
  let sync: jest.Mocked<AnimeSyncPort>;
  let repo: jest.Mocked<AnimeRepositoryPort>;
  let useCase: ImportTrendingUseCase;

  beforeEach(() => {
    sync = makeSyncMock();
    repo = makeRepoMock();
    useCase = new ImportTrendingUseCase(sync, repo);
  });

  it("walks every page and saves every entity returned", async () => {
    const page1 = [makeAnimeEntity({ id: "a" }), makeAnimeEntity({ id: "b" })];
    const page2 = [makeAnimeEntity({ id: "c" })];
    sync.fetchTrending.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const result = await useCase.execute({ pages: 2, perPage: 20 });

    expect(sync.fetchTrending).toHaveBeenNthCalledWith(1, 1, 20);
    expect(sync.fetchTrending).toHaveBeenNthCalledWith(2, 2, 20);
    expect(repo.save).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ imported: 3, pagesFetched: 2 });
  });

  it("stops early when a page comes back empty (no more data upstream)", async () => {
    sync.fetchTrending
      .mockResolvedValueOnce([makeAnimeEntity({ id: "a" })])
      .mockResolvedValueOnce([]);

    const result = await useCase.execute({ pages: 5, perPage: 20 });

    expect(sync.fetchTrending).toHaveBeenCalledTimes(2);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ imported: 1, pagesFetched: 2 });
  });
});
