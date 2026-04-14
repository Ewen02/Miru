import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { GetAnimeCatalogUseCase } from "../../application/use-cases/get-anime-catalog.use-case";
import { GetAnimeDetailUseCase } from "../../application/use-cases/get-anime-detail.use-case";
import { AnimeCatalogQueryDto } from "../../application/dtos/anime-catalog.dto";
import { AnimeMapper } from "../../application/mappers/anime.mapper";

@Controller("animes")
export class AnimeController {
  constructor(
    private readonly getAnimeCatalog: GetAnimeCatalogUseCase,
    private readonly getAnimeDetail: GetAnimeDetailUseCase,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
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

  @Get(":id")
  async detail(@Param("id") id: string) {
    const anime = await this.getAnimeDetail.execute(id);
    return AnimeMapper.toCard(anime);
  }
}
