import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import type { StudioDetail } from "@miru/types";
import { GetStudioDetailUseCase } from "../../application/use-cases/get-studio-detail.use-case";
import { AnimeMapper } from "@modules/anime/application/mappers/anime.mapper";

@Controller("studios")
export class StudioController {
  constructor(private readonly getStudioDetail: GetStudioDetailUseCase) {}

  @Get(":slug")
  async detail(
    @Param("slug") slug: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("pageSize", new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ): Promise<StudioDetail> {
    const { studio, stats, animes } = await this.getStudioDetail.execute({
      slug,
      page,
      pageSize,
    });
    return {
      slug: studio.slug,
      name: studio.name,
      stats,
      animes: {
        ...animes,
        data: AnimeMapper.toCardList(animes.data),
      },
    };
  }
}
