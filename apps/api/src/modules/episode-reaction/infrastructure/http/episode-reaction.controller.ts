import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { EpisodeHeatmapDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { GetEpisodeHeatmapUseCase } from "../../application/use-cases/get-episode-heatmap.use-case";
import { AddEpisodeReactionUseCase } from "../../application/use-cases/add-episode-reaction.use-case";
import { EpisodeReactionMapper } from "../../application/mappers/episode-reaction.mapper";
import { AddReactionDto, HeatmapQueryDto } from "../../application/dtos/episode-reaction.dto";

@Controller("episodes")
export class EpisodeReactionController {
  constructor(
    private readonly getHeatmap: GetEpisodeHeatmapUseCase,
    private readonly addReaction: AddEpisodeReactionUseCase,
  ) {}

  @Get(":id/heatmap")
  async heatmap(
    @Param("id") episodeId: string,
    @Query() query: HeatmapQueryDto,
  ): Promise<EpisodeHeatmapDto> {
    const tally = await this.getHeatmap.execute({
      episodeId,
      bucketSeconds: query.bucketSeconds,
    });
    return EpisodeReactionMapper.toHeatmapDto(tally);
  }

  @Post(":id/reactions")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async react(
    @Param("id") episodeId: string,
    @CurrentUserId() userId: string,
    @Body() body: AddReactionDto,
  ): Promise<EpisodeHeatmapDto> {
    await this.addReaction.execute({
      episodeId,
      userId,
      secondMark: body.secondMark,
      kind: body.kind,
    });
    const tally = await this.getHeatmap.execute({ episodeId });
    return EpisodeReactionMapper.toHeatmapDto(tally);
  }
}
