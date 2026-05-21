import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { GetAnimeCatalogUseCase } from "../../application/use-cases/get-anime-catalog.use-case";
import { GetAnimeDetailUseCase } from "../../application/use-cases/get-anime-detail.use-case";
import { GetAnimeAccentUseCase } from "../../application/use-cases/get-anime-accent.use-case";
import { GetAnimeCharactersUseCase } from "../../application/use-cases/get-anime-characters.use-case";
import { GetRecommendationsUseCase } from "../../application/use-cases/get-recommendations.use-case";
import { AnimeCatalogQueryDto } from "../../application/dtos/anime-catalog.dto";
import { AnimeMapper } from "../../application/mappers/anime.mapper";

@Controller("animes")
export class AnimeController {
  constructor(
    private readonly getAnimeCatalog: GetAnimeCatalogUseCase,
    private readonly getAnimeDetail: GetAnimeDetailUseCase,
    private readonly getAnimeAccent: GetAnimeAccentUseCase,
    private readonly getAnimeCharacters: GetAnimeCharactersUseCase,
    private readonly getRecommendations: GetRecommendationsUseCase,
  ) {}

  /**
   * Personalized recommendations for the authenticated user. Order is
   * stable for a given watchlist state; results change as the user adds
   * or removes entries.
   */
  @Get("recommendations/me")
  @UseGuards(AuthRequiredGuard)
  async recommendations(
    @CurrentUserId() userId: string,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const animes = await this.getRecommendations.execute({ userId, limit });
    return AnimeMapper.toCardList(animes);
  }

  @Get()
  async catalog(@Query() query: AnimeCatalogQueryDto) {
    const result = await this.getAnimeCatalog.execute({
      filters: {
        search: query.search,
        status: query.status,
        format: query.format,
        genres: query.genres,
        year: query.year,
      },
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return {
      ...result,
      data: AnimeMapper.toCardList(result.data),
    };
  }

  @Get(":slug")
  async detail(@Param("slug") slug: string) {
    const { anime, slugByAnilistId } = await this.getAnimeDetail.execute(slug);
    return AnimeMapper.toDetail(anime, slugByAnilistId);
  }

  @Get(":slug/accent")
  async accent(@Param("slug") slug: string) {
    return this.getAnimeAccent.execute(slug);
  }

  @Get(":slug/characters")
  async characters(@Param("slug") slug: string) {
    const characters = await this.getAnimeCharacters.execute(slug);
    return AnimeMapper.toCharacterCards(characters);
  }
}
