import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { RunContextService } from "@shared/infrastructure/context/run-context.service";
import { concurrentMap } from "@shared/utils/concurrent-map";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { EpisodeSyncPort } from "@modules/anime/domain/ports/episode-sync.port";
import { ANIME_REPOSITORY, EPISODE_SYNC } from "@modules/anime/application/tokens";

interface RetryFailedSyncsInput {
  /** Max animes per tick. Avoid spiking AniList/Jikan if the queue is large. */
  limit?: number;
}

interface RetryFailedSyncsOutput {
  attempted: number;
  succeeded: number;
  failed: number;
}

const DEFAULT_LIMIT = 50;
const RETRY_CONCURRENCY = 3;

/**
 * Picks up animes whose retry window has elapsed and replays the episodes
 * sync against them. On success, clears the retry state; on failure,
 * `markSyncFailed` re-schedules with the next backoff step.
 *
 * Scoped to episodes sync only (the most failure-prone path — Jikan
 * pagination + occasional 5xx). Trending re-sync is not part of the
 * retry queue because the daily cron will pick up the slack regardless.
 */
@Injectable()
export class RetryFailedSyncsUseCase implements UseCase<
  RetryFailedSyncsInput,
  RetryFailedSyncsOutput
> {
  private readonly logger = new Logger(RetryFailedSyncsUseCase.name);

  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
    @Inject(EPISODE_SYNC) private readonly sync: EpisodeSyncPort,
    private readonly runContext: RunContextService,
  ) {}

  async execute(input: RetryFailedSyncsInput = {}): Promise<RetryFailedSyncsOutput> {
    const runId = this.runContext.runId();
    const limit = input.limit ?? DEFAULT_LIMIT;
    const candidates = await this.repo.findReadyForRetry(limit);
    if (candidates.length === 0) {
      return { attempted: 0, succeeded: 0, failed: 0 };
    }

    this.logger.log(`[run=${runId}] Retrying ${candidates.length} previously failed anime(s)`);

    let succeeded = 0;
    let failed = 0;

    await concurrentMap(candidates, RETRY_CONCURRENCY, async (anime) => {
      const malId = anime.externalMalId;
      if (malId == null) {
        // No external id to retry against — clear state to stop picking it up.
        await this.repo.clearSyncRetry(anime.id).catch(() => undefined);
        return;
      }
      try {
        const episodes = await this.sync.fetchEpisodes(malId);
        await this.repo.saveEpisodes(anime.id, episodes);
        await this.repo.clearSyncRetry(anime.id);
        succeeded += 1;
        this.logger.log(
          `[run=${runId}] Retry OK: "${anime.title}" (MAL ${malId}) → ${episodes.length} episode(s)`,
        );
      } catch (err) {
        failed += 1;
        await this.repo.markSyncFailed(anime.id).catch(() => undefined);
        this.logger.warn(
          `[run=${runId}] Retry FAILED: "${anime.title}" (MAL ${malId}): ${(err as Error).message}`,
        );
      }
    });

    return { attempted: candidates.length, succeeded, failed };
  }
}
