import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetEpisodeHeatmapUseCase } from "./application/use-cases/get-episode-heatmap.use-case";
import { AddEpisodeReactionUseCase } from "./application/use-cases/add-episode-reaction.use-case";
import { EPISODE_REACTION_REPOSITORY } from "./application/tokens";
import { PrismaEpisodeReactionRepository } from "./infrastructure/persistence/prisma-episode-reaction.repository";
import { EpisodeReactionController } from "./infrastructure/http/episode-reaction.controller";

@Module({
  imports: [PrismaModule],
  controllers: [EpisodeReactionController],
  providers: [
    GetEpisodeHeatmapUseCase,
    AddEpisodeReactionUseCase,
    { provide: EPISODE_REACTION_REPOSITORY, useClass: PrismaEpisodeReactionRepository },
  ],
  exports: [EPISODE_REACTION_REPOSITORY],
})
export class EpisodeReactionModule {}
