import { Module } from "@nestjs/common";
import { AnimeModule } from "@modules/anime/anime.module";
import { ImportTrendingUseCase } from "./application/use-cases/import-trending.use-case";

@Module({
  imports: [AnimeModule],
  providers: [ImportTrendingUseCase],
  exports: [ImportTrendingUseCase],
})
export class SyncModule {}
