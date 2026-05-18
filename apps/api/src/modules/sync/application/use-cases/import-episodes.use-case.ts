import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { EpisodeSyncPort } from "@modules/anime/domain/ports/episode-sync.port";
import { ANIME_REPOSITORY, EPISODE_SYNC } from "@modules/anime/application/tokens";
import { EnrichEpisodesUseCase } from "./enrich-episodes.use-case";

interface ImportEpisodesInput {
  limit?: number;
  airingOnly?: boolean;
}

interface ImportEpisodesOutput {
  animesProcessed: number;
  episodesImported: number;
  episodesEnriched: number;
  skipped: number;
}

@Injectable()
export class ImportEpisodesUseCase implements UseCase<ImportEpisodesInput, ImportEpisodesOutput> {
  private readonly logger = new Logger(ImportEpisodesUseCase.name);

  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
    @Inject(EPISODE_SYNC) private readonly sync: EpisodeSyncPort,
    private readonly enrich: EnrichEpisodesUseCase,
  ) {}

  async execute({ limit, airingOnly }: ImportEpisodesInput): Promise<ImportEpisodesOutput> {
    const animes = await this.repo.findAllWithMalId({ limit, airingOnly });
    this.logger.log(
      `Found ${animes.length} anime with MAL id${airingOnly ? " (airing only)" : ""}`,
    );

    let episodesImported = 0;
    let skipped = 0;

    for (const anime of animes) {
      const malId = anime.externalMalId;
      if (malId == null) {
        skipped += 1;
        continue;
      }
      try {
        const episodes = await this.sync.fetchEpisodes(malId);
        await this.repo.saveEpisodes(anime.id, episodes);
        episodesImported += episodes.length;
        this.logger.log(`"${anime.title}" (MAL ${malId}) → ${episodes.length} episode(s)`);
      } catch (err) {
        skipped += 1;
        this.logger.warn(`Failed for "${anime.title}" (MAL ${malId}): ${(err as Error).message}`);
      }
    }

    let episodesEnriched = 0;
    try {
      const enrichResult = await this.enrich.execute({ limit, airingOnly });
      episodesEnriched = enrichResult.episodesEnriched;
    } catch (err) {
      // Enrichment is a best-effort second pass — don't lose the imported
      // episodes if it fails (e.g. AniList throttled or a single anime errored).
      this.logger.warn(`Enrich step failed, continuing: ${(err as Error).message}`);
    }

    return {
      animesProcessed: animes.length - skipped,
      episodesImported,
      episodesEnriched,
      skipped,
    };
  }
}
