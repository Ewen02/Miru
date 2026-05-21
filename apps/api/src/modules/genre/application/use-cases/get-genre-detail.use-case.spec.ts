import { NotFoundException } from "@shared/domain/domain-exception";
import { GenreEntity } from "../../domain/entities/genre.entity";
import { GenreRepositoryPort } from "../../domain/ports/genre-repository.port";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { GetGenreDetailUseCase } from "./get-genre-detail.use-case";

function makeGenreRepoMock(): jest.Mocked<GenreRepositoryPort> {
  return {
    findAll: jest.fn(),
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

describe("GetGenreDetailUseCase", () => {
  let genres: jest.Mocked<GenreRepositoryPort>;
  let animes: jest.Mocked<AnimeRepositoryPort>;
  let useCase: GetGenreDetailUseCase;

  beforeEach(() => {
    genres = makeGenreRepoMock();
    animes = makeAnimeRepoMock();
    useCase = new GetGenreDetailUseCase(genres, animes);
  });

  it("throws 404 when the genre is not found", async () => {
    genres.findBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute({ slug: "unknown", page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns genre + stats + paginated animes for a known slug", async () => {
    const genre = GenreEntity.create("g1", { name: "Drama", slug: "drama" });
    genres.findBySlug.mockResolvedValue(genre);
    genres.statsBySlug.mockResolvedValue({
      totalAnimes: 284,
      thisYearAnimes: 12,
      averageRating: 7.8,
    });
    animes.findByFilters.mockResolvedValue({
      data: [],
      total: 284,
      page: 1,
      pageSize: 20,
      hasNext: true,
    });

    const result = await useCase.execute({ slug: "drama", page: 1, pageSize: 20 });

    expect(genres.findBySlug).toHaveBeenCalledWith("drama");
    expect(animes.findByFilters).toHaveBeenCalledWith(
      { genres: ["drama"] },
      { page: 1, pageSize: 20 },
    );
    expect(result.genre).toBe(genre);
    expect(result.stats.totalAnimes).toBe(284);
    expect(result.animes.total).toBe(284);
  });
});
