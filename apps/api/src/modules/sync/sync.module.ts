import { Module } from "@nestjs/common";
import { AnimeModule } from "@modules/anime/anime.module";
import { ImportTrendingUseCase } from "./application/use-cases/import-trending.use-case";
import { ImportBySeasonUseCase } from "./application/use-cases/import-by-season.use-case";
import { ImportEpisodesUseCase } from "./application/use-cases/import-episodes.use-case";
import { EnrichEpisodesUseCase } from "./application/use-cases/enrich-episodes.use-case";
import { SyncSchedulerService } from "./infrastructure/scheduler/sync-scheduler.service";

@Module({
  imports: [AnimeModule],
  providers: [
    ImportTrendingUseCase,
    ImportBySeasonUseCase,
    ImportEpisodesUseCase,
    EnrichEpisodesUseCase,
    SyncSchedulerService,
  ],
  exports: [
    ImportTrendingUseCase,
    ImportBySeasonUseCase,
    ImportEpisodesUseCase,
    EnrichEpisodesUseCase,
  ],
})
export class SyncModule {}
