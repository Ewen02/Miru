import { Module } from "@nestjs/common";
import { AnimeModule } from "@modules/anime/anime.module";
import { ImportTrendingUseCase } from "./application/use-cases/import-trending.use-case";
import { ImportEpisodesUseCase } from "./application/use-cases/import-episodes.use-case";
import { EnrichEpisodesUseCase } from "./application/use-cases/enrich-episodes.use-case";
import { SyncSchedulerService } from "./infrastructure/scheduler/sync-scheduler.service";

@Module({
  imports: [AnimeModule],
  providers: [
    ImportTrendingUseCase,
    ImportEpisodesUseCase,
    EnrichEpisodesUseCase,
    SyncSchedulerService,
  ],
  exports: [ImportTrendingUseCase, ImportEpisodesUseCase, EnrichEpisodesUseCase],
})
export class SyncModule {}
