import { Module } from "@nestjs/common";
import { AniListClient } from "@miru/anilist";
import { JikanClient } from "@miru/jikan";

// Application
import { GetAnimeCatalogUseCase } from "./application/use-cases/get-anime-catalog.use-case";
import { GetAnimeDetailUseCase } from "./application/use-cases/get-anime-detail.use-case";
import { GetAnimeAccentUseCase } from "./application/use-cases/get-anime-accent.use-case";
import { GetAnimeCharactersUseCase } from "./application/use-cases/get-anime-characters.use-case";
import { GetCalendarWeekUseCase } from "./application/use-cases/get-calendar-week.use-case";
import { GetRecommendationsUseCase } from "./application/use-cases/get-recommendations.use-case";
import {
  ANILIST_CLIENT,
  ANIME_REPOSITORY,
  ANIME_SYNC,
  EPISODE_SYNC,
  JIKAN_CLIENT,
} from "./application/tokens";

// Infrastructure
import { AnimeController } from "./infrastructure/http/anime.controller";
import { CalendarController } from "./infrastructure/http/calendar.controller";
import { PrismaAnimeRepository } from "./infrastructure/persistence/prisma-anime.repository";
import { AniListSyncAdapter } from "./infrastructure/external/anilist-sync.adapter";
import { JikanEpisodeAdapter } from "./infrastructure/external/jikan-episode.adapter";

// Shared
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AnimeController, CalendarController],
  providers: [
    GetAnimeCatalogUseCase,
    GetAnimeDetailUseCase,
    GetAnimeAccentUseCase,
    GetAnimeCharactersUseCase,
    GetCalendarWeekUseCase,
    GetRecommendationsUseCase,
    { provide: ANILIST_CLIENT, useFactory: () => new AniListClient() },
    { provide: JIKAN_CLIENT, useFactory: () => new JikanClient() },
    { provide: ANIME_REPOSITORY, useClass: PrismaAnimeRepository },
    { provide: ANIME_SYNC, useClass: AniListSyncAdapter },
    { provide: EPISODE_SYNC, useClass: JikanEpisodeAdapter },
  ],
  exports: [ANIME_REPOSITORY, ANIME_SYNC, EPISODE_SYNC, ANILIST_CLIENT],
})
export class AnimeModule {}
