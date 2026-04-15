import { Module } from "@nestjs/common";
import { AnimeModule } from "@modules/anime/anime.module";
import { ImportTrendingUseCase } from "./application/use-cases/import-trending.use-case";
import { ImportEpisodesUseCase } from "./application/use-cases/import-episodes.use-case";

@Module({
  imports: [AnimeModule],
  providers: [ImportTrendingUseCase, ImportEpisodesUseCase],
  exports: [ImportTrendingUseCase, ImportEpisodesUseCase],
})
export class SyncModule {}
