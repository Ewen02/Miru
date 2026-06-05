import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { concurrentMap } from "@shared/utils/concurrent-map";
import { RunContextService } from "@shared/infrastructure/context/run-context.service";
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

/**
 * The Jikan client already throttles to ~1.6 req/s globally. Fanning out
 * more workers than that won't go faster on the network side — but the
 * DB write for one anime overlaps with the throttle wait of the next,
 * which is where the real speedup lives.
 */
const FETCH_CONCURRENCY = 3;

@Injectable()
export class ImportEpisodesUseCase implements UseCase<ImportEpisodesInput, ImportEpisodesOutput> {
  private readonly logger = new Logger(ImportEpisodesUseCase.name);

  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
    @Inject(EPISODE_SYNC) private readonly sync: EpisodeSyncPort,
    private readonly enrich: EnrichEpisodesUseCase,
    private readonly runContext: RunContextService,
  ) {}

  async execute({ limit, airingOnly }: ImportEpisodesInput): Promise<ImportEpisodesOutput> {
    const runId = this.runContext.runId();
    const animes = await this.repo.findAllWithMalId({ limit, airingOnly });
    this.logger.log(
      `[run=${runId}] Found ${animes.length} anime with MAL id${airingOnly ? " (airing only)" : ""}`,
    );

    let episodesImported = 0;
    let skipped = 0;

    await concurrentMap(animes, FETCH_CONCURRENCY, async (anime) => {
      const malId = anime.externalMalId;
      if (malId == null) {
        skipped += 1;
        return;
      }
      try {
        const episodes = await this.sync.fetchEpisodes(malId);
        await this.repo.saveEpisodes(anime.id, episodes);
        episodesImported += episodes.length;
        this.logger.log(
          `[run=${runId}] "${anime.title}" (MAL ${malId}) → ${episodes.length} episode(s)`,
        );
      } catch (err) {
        skipped += 1;
        await this.repo.markSyncFailed(anime.id).catch(() => undefined);
        this.logger.warn(
          `[run=${runId}] Failed for "${anime.title}" (MAL ${malId}): ${(err as Error).message}`,
        );
      }
    });

    let episodesEnriched = 0;
    try {
      const enrichResult = await this.enrich.execute({ limit, airingOnly });
      episodesEnriched = enrichResult.episodesEnriched;
    } catch (err) {
      // Enrichment is a best-effort second pass — don't lose the imported
      // episodes if it fails (e.g. AniList throttled or a single anime errored).
      this.logger.warn(`[run=${runId}] Enrich step failed, continuing: ${(err as Error).message}`);
    }

    return {
      animesProcessed: animes.length - skipped,
      episodesImported,
      episodesEnriched,
      skipped,
    };
  }
}
