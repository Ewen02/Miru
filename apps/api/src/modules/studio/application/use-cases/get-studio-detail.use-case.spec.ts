import { NotFoundException } from "@shared/domain/domain-exception";
import { StudioEntity } from "../../domain/entities/studio.entity";
import { StudioRepositoryPort } from "../../domain/ports/studio-repository.port";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { GetStudioDetailUseCase } from "./get-studio-detail.use-case";

function makeStudioRepoMock(): jest.Mocked<StudioRepositoryPort> {
  return {
    findBySlug: jest.fn(),
    statsBySlug: jest.fn(),
  };
}

function makeAnimeRepoMock(): jest.Mocked<AnimeRepositoryPort> {
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

describe("GetStudioDetailUseCase", () => {
  let studios: jest.Mocked<StudioRepositoryPort>;
  let animes: jest.Mocked<AnimeRepositoryPort>;
  let useCase: GetStudioDetailUseCase;

  beforeEach(() => {
    studios = makeStudioRepoMock();
    animes = makeAnimeRepoMock();
    useCase = new GetStudioDetailUseCase(studios, animes);
  });

  it("throws 404 for an unknown slug", async () => {
    studios.findBySlug.mockResolvedValue(null);
    await expect(
      useCase.execute({ slug: "ghost", page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns studio + stats + paginated filmography", async () => {
    const studio = StudioEntity.create("s1", { name: "MAPPA", slug: "mappa" });
    studios.findBySlug.mockResolvedValue(studio);
    studios.statsBySlug.mockResolvedValue({
      totalAnimes: 47,
      averageRating: 8.4,
      tvCount: 32,
      movieCount: 15,
    });
    animes.findByFilters.mockResolvedValue({
      data: [],
      total: 47,
      page: 1,
      pageSize: 20,
      hasNext: true,
    });

    const result = await useCase.execute({ slug: "mappa", page: 1, pageSize: 20 });

    expect(animes.findByFilters).toHaveBeenCalledWith(
      { studioSlug: "mappa" },
      { page: 1, pageSize: 20 },
    );
    expect(result.studio).toBe(studio);
    expect(result.stats.totalAnimes).toBe(47);
  });
});
