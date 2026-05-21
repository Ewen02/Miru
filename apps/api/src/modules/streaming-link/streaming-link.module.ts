import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListEpisodeLinksUseCase } from "./application/use-cases/list-episode-links.use-case";
import { RefreshAnimeLinksUseCase } from "./application/use-cases/refresh-anime-links.use-case";
import { VerifyStaleLinksUseCase } from "./application/use-cases/verify-stale-links.use-case";
import { EPISODE_LINK_PROVIDERS, EPISODE_LINK_REPOSITORY } from "./application/tokens";
import { PrismaEpisodeLinkRepository } from "./infrastructure/persistence/prisma-episode-link.repository";
import { CrunchyrollScraperAdapter } from "./infrastructure/external/crunchyroll-scraper.adapter";
import { ADNScraperAdapter } from "./infrastructure/external/adn-scraper.adapter";
import { StreamingLinkScheduler } from "./infrastructure/scheduler/streaming-link.scheduler";

/**
 * Phase 4 — per-episode streaming links. Designed to be **inert** when
 * `ENABLE_SCRAPERS=false`: no controller is exposed, the read use case
 * returns [] regardless of DB state, and the scheduler short-circuits
 * before any outbound request.
 *
 * `ListEpisodeLinksUseCase` is exported so the `anime` module can consume
 * it when rendering /anime/[slug] (without taking a hard infra dep).
 */
@Module({
  imports: [PrismaModule],
  providers: [
    ListEpisodeLinksUseCase,
    RefreshAnimeLinksUseCase,
    VerifyStaleLinksUseCase,
    StreamingLinkScheduler,
    CrunchyrollScraperAdapter,
    ADNScraperAdapter,
    { provide: EPISODE_LINK_REPOSITORY, useClass: PrismaEpisodeLinkRepository },
    // Multi-injection — RefreshAnimeLinksUseCase walks every provider in
    // this array. Add a new platform here.
    {
      provide: EPISODE_LINK_PROVIDERS,
      useFactory: (cr: CrunchyrollScraperAdapter, adn: ADNScraperAdapter) => [cr, adn],
      inject: [CrunchyrollScraperAdapter, ADNScraperAdapter],
    },
  ],
  exports: [ListEpisodeLinksUseCase],
})
export class StreamingLinkModule {}
