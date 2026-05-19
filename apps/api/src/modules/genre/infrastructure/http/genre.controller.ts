import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import type { GenreCard, GenreDetail } from "@miru/types";
import { ListGenresUseCase } from "../../application/use-cases/list-genres.use-case";
import { GetGenreDetailUseCase } from "../../application/use-cases/get-genre-detail.use-case";
import { AnimeMapper } from "@modules/anime/application/mappers/anime.mapper";

@Controller("genres")
export class GenreController {
  constructor(
    private readonly listGenres: ListGenresUseCase,
    private readonly getGenreDetail: GetGenreDetailUseCase,
  ) {}

  @Get()
  async list(): Promise<GenreCard[]> {
    const genres = await this.listGenres.execute();
    return genres.map((g) => ({ slug: g.slug, name: g.name }));
  }

  @Get(":slug")
  async detail(
    @Param("slug") slug: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("pageSize", new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ): Promise<GenreDetail> {
    const { genre, stats, animes } = await this.getGenreDetail.execute({
      slug,
      page,
      pageSize,
    });
    return {
      slug: genre.slug,
      name: genre.name,
      stats,
      animes: {
        ...animes,
        data: AnimeMapper.toCardList(animes.data),
      },
    };
  }
}
