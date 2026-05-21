import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { EpisodeLinkPort } from "../../domain/ports/episode-link.port";
import { EpisodeLinkRepositoryPort } from "../../domain/ports/episode-link-repository.port";
import { EPISODE_LINK_PROVIDERS, EPISODE_LINK_REPOSITORY } from "../tokens";

interface Input {
  animeId: string;
}

interface Output {
  /** Per-source count of links upserted. */
  upserted: Record<string, number>;
}

/**
 * Walks every registered EpisodeLinkPort, scrapes the episode list for
 * the given anime, then upserts the matched links. No-op when
 * ENABLE_SCRAPERS=false.
 */
@Injectable()
export class RefreshAnimeLinksUseCase implements UseCase<Input, Output> {
  private readonly logger = new Logger(RefreshAnimeLinksUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EPISODE_LINK_REPOSITORY)
    private readonly repo: EpisodeLinkRepositoryPort,
    @Inject(EPISODE_LINK_PROVIDERS)
    private readonly providers: EpisodeLinkPort[],
  ) {}

  async execute({ animeId }: Input): Promise<Output> {
    if (process.env.ENABLE_SCRAPERS !== "true") {
      return { upserted: {} };
    }

    const anime = await this.prisma.anime.findUnique({
      where: { id: animeId },
      select: {
        externalAnilistId: true,
        externalMalId: true,
        titleEn: true,
        title: true,
        episodes: { select: { id: true, number: true } },
      },
    });
    if (!anime) return { upserted: {} };

    const episodesByNumber = new Map(anime.episodes.map((e) => [e.number, e.id]));
    const upserted: Record<string, number> = {};

    for (const provider of this.providers) {
      try {
        const links = await provider.fetchEpisodeLinks({
          anilistId: anime.externalAnilistId,
          malId: anime.externalMalId,
          titleEn: anime.titleEn,
          titleRomaji: anime.title,
        });
        let count = 0;
        for (const link of links) {
          const episodeId = episodesByNumber.get(link.episodeNumber);
          if (!episodeId) continue;
          await this.repo.upsert({
            episodeId,
            source: provider.source,
            url: link.url,
          });
          count += 1;
        }
        upserted[provider.source] = count;
      } catch (err) {
        this.logger.warn(
          `Scraper ${provider.source} failed for anime ${animeId}: ${(err as Error).message}`,
        );
      }
    }

    return { upserted };
  }
}
