import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { AnimeSyncPort } from "@modules/anime/domain/ports/anime-sync.port";
import { ANIME_REPOSITORY, ANIME_SYNC } from "@modules/anime/application/tokens";

interface EnrichEpisodesInput {
  limit?: number;
  airingOnly?: boolean;
}

interface EnrichEpisodesOutput {
  animesProcessed: number;
  episodesEnriched: number;
  skipped: number;
}

@Injectable()
export class EnrichEpisodesUseCase implements UseCase<EnrichEpisodesInput, EnrichEpisodesOutput> {
  private readonly logger = new Logger(EnrichEpisodesUseCase.name);

  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
    @Inject(ANIME_SYNC) private readonly sync: AnimeSyncPort,
  ) {}

  async execute({ limit, airingOnly }: EnrichEpisodesInput): Promise<EnrichEpisodesOutput> {
    const animes = await this.repo.findAllWithAnilistId({ limit, airingOnly });
    this.logger.log(`Enriching ${animes.length} anime(s) via AniList streamingEpisodes`);

    let episodesEnriched = 0;
    let skipped = 0;

    for (const anime of animes) {
      const anilistId = anime.toSnapshot().externalAnilistId;
      if (anilistId == null) {
        skipped += 1;
        continue;
      }
      try {
        const streaming = await this.sync.fetchStreamingEpisodes(anilistId);
        if (streaming.length === 0) {
          skipped += 1;
          continue;
        }
        const updated = await this.repo.enrichEpisodes(anime.id, streaming);
        episodesEnriched += updated;
        this.logger.log(`"${anime.title}" (AniList ${anilistId}) → ${updated} episode(s) enriched`);
      } catch (err) {
        skipped += 1;
        this.logger.warn(
          `Enrich failed for "${anime.title}" (AniList ${anilistId}): ${(err as Error).message}`,
        );
      }
    }

    return { animesProcessed: animes.length - skipped, episodesEnriched, skipped };
  }
}
