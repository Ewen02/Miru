import { Module } from "@nestjs/common";

// Application
import { GetAnimeCatalogUseCase } from "./application/use-cases/get-anime-catalog.use-case";
import { GetAnimeDetailUseCase } from "./application/use-cases/get-anime-detail.use-case";
import { ANIME_REPOSITORY } from "./application/tokens";

// Infrastructure
import { AnimeController } from "./infrastructure/http/anime.controller";
import { PrismaAnimeRepository } from "./infrastructure/persistence/prisma-anime.repository";

// Shared
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AnimeController],
  providers: [
    // Use cases
    GetAnimeCatalogUseCase,
    GetAnimeDetailUseCase,

    // Port bindings — le cœur du pattern hexagonal
    // On bind l'interface (token) à l'implémentation concrète
    {
      provide: ANIME_REPOSITORY,
      useClass: PrismaAnimeRepository,
    },
  ],
  exports: [ANIME_REPOSITORY],
})
export class AnimeModule {}
