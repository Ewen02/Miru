import { AnimeRepositoryPort } from "../../domain/ports/anime-repository.port";
import { AnimeNotFoundException } from "../../domain/exceptions/anime.exceptions";
import { makeAnimeEntity } from "../../domain/entities/__fixtures__/anime.fixture";
import { GetAnimeDetailUseCase } from "./get-anime-detail.use-case";

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
    delete: jest.fn(),
  };
}

describe("GetAnimeDetailUseCase", () => {
  let repo: jest.Mocked<AnimeRepositoryPort>;
  let useCase: GetAnimeDetailUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new GetAnimeDetailUseCase(repo);
  });

  it("throws AnimeNotFoundException when no anime matches the slug", async () => {
    repo.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(AnimeNotFoundException);
    expect(repo.findSlugsByAnilistIds).not.toHaveBeenCalled();
  });

  it("returns the anime and resolves local slugs for its relations", async () => {
    const entity = makeAnimeEntity({
      relations: [
        {
          relatedExternalAnilistId: 42,
          relationType: "SEQUEL",
          title: "Sequel",
          coverUrl: null,
          format: null,
          year: null,
        },
        {
          relatedExternalAnilistId: 99,
          relationType: "PREQUEL",
          title: "Unknown prequel",
          coverUrl: null,
          format: null,
          year: null,
        },
      ],
    });
    repo.findBySlug.mockResolvedValue(entity);
    repo.findSlugsByAnilistIds.mockResolvedValue(new Map([[42, "sequel-slug"]]));

    const result = await useCase.execute("test-anime");

    expect(repo.findSlugsByAnilistIds).toHaveBeenCalledWith([42, 99]);
    expect(result.anime).toBe(entity);
    expect(result.slugByAnilistId.get(42)).toBe("sequel-slug");
    expect(result.slugByAnilistId.has(99)).toBe(false);
  });

  it("still queries slugs (with an empty array) when the anime has no relations", async () => {
    const entity = makeAnimeEntity();
    repo.findBySlug.mockResolvedValue(entity);
    repo.findSlugsByAnilistIds.mockResolvedValue(new Map());

    const result = await useCase.execute("test-anime");

    expect(repo.findSlugsByAnilistIds).toHaveBeenCalledWith([]);
    expect(result.slugByAnilistId.size).toBe(0);
  });
});
