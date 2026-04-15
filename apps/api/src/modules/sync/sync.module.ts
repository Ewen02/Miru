import { Module } from "@nestjs/common";
import { AnimeModule } from "@modules/anime/anime.module";
import { ImportTrendingUseCase } from "./application/use-cases/import-trending.use-case";
import { ImportEpisodesUseCase } from "./application/use-cases/import-episodes.use-case";
import { SyncSchedulerService } from "./infrastructure/scheduler/sync-scheduler.service";

@Module({
  imports: [AnimeModule],
  providers: [ImportTrendingUseCase, ImportEpisodesUseCase, SyncSchedulerService],
  exports: [ImportTrendingUseCase, ImportEpisodesUseCase],
})
export class SyncModule {}
