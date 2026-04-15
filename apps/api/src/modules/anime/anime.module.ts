import { Module } from "@nestjs/common";

// Application
import { GetAnimeCatalogUseCase } from "./application/use-cases/get-anime-catalog.use-case";
import { GetAnimeDetailUseCase } from "./application/use-cases/get-anime-detail.use-case";
import { GetAnimeCharactersUseCase } from "./application/use-cases/get-anime-characters.use-case";
import { ANIME_REPOSITORY, ANIME_SYNC, EPISODE_SYNC } from "./application/tokens";

// Infrastructure
import { AnimeController } from "./infrastructure/http/anime.controller";
import { PrismaAnimeRepository } from "./infrastructure/persistence/prisma-anime.repository";
import { AniListSyncAdapter } from "./infrastructure/external/anilist-sync.adapter";
import { JikanEpisodeAdapter } from "./infrastructure/external/jikan-episode.adapter";

// Shared
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AnimeController],
  providers: [
    GetAnimeCatalogUseCase,
    GetAnimeDetailUseCase,
    GetAnimeCharactersUseCase,
    { provide: ANIME_REPOSITORY, useClass: PrismaAnimeRepository },
    { provide: ANIME_SYNC, useClass: AniListSyncAdapter },
    { provide: EPISODE_SYNC, useClass: JikanEpisodeAdapter },
  ],
  exports: [ANIME_REPOSITORY, ANIME_SYNC, EPISODE_SYNC],
})
export class AnimeModule {}
