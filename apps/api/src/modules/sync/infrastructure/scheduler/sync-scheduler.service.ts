import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RunContextService } from "@shared/infrastructure/context/run-context.service";
import { ImportTrendingUseCase } from "../../application/use-cases/import-trending.use-case";
import { ImportEpisodesUseCase } from "../../application/use-cases/import-episodes.use-case";
import { RetryFailedSyncsUseCase } from "../../application/use-cases/retry-failed-syncs.use-case";

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private readonly enabled = process.env.ENABLE_SCHEDULER === "true";

  constructor(
    private readonly importTrending: ImportTrendingUseCase,
    private readonly importEpisodes: ImportEpisodesUseCase,
    private readonly retryFailed: RetryFailedSyncsUseCase,
    private readonly runContext: RunContextService,
  ) {}

  onModuleInit(): void {
    this.logger.log(`Scheduler ${this.enabled ? "ENABLED" : "DISABLED"} (ENABLE_SCHEDULER)`);
  }

  /** Quotidien à 4h UTC : rafraîchit le catalogue trending. */
  @Cron("0 4 * * *", { name: "sync-trending-daily" })
  async handleTrendingDaily(): Promise<void> {
    if (!this.enabled) return;
    await this.runContext.run("sync-trending-daily", async () => {
      const runId = this.runContext.runId();
      this.logger.log(`[run=${runId}] Cron tick: sync:trending`);
      try {
        const result = await this.importTrending.execute({ pages: 3, perPage: 20 });
        this.logger.log(
          `[run=${runId}] Trending sync done: ${result.imported} imported across ${result.pagesFetched} pages`,
        );
      } catch (err) {
        this.logger.warn(`[run=${runId}] Trending sync failed: ${(err as Error).message}`);
      }
    });
  }

  /** Toutes les 10 minutes : rafraîchit les épisodes des animes en cours de diffusion. */
  @Cron(CronExpression.EVERY_10_MINUTES, { name: "sync-episodes-airing" })
  async handleEpisodesHourly(): Promise<void> {
    if (!this.enabled) return;
    await this.runContext.run("sync-episodes-airing", async () => {
      const runId = this.runContext.runId();
      this.logger.log(`[run=${runId}] Cron tick: sync:episodes airingOnly`);
      try {
        const result = await this.importEpisodes.execute({ airingOnly: true });
        this.logger.log(
          `[run=${runId}] Airing episodes sync done: ${result.episodesImported} episodes across ${result.animesProcessed} anime (skipped ${result.skipped})`,
        );
      } catch (err) {
        this.logger.warn(`[run=${runId}] Episodes sync failed: ${(err as Error).message}`);
      }
    });
  }

  /**
   * Hourly: pick up animes whose retry window has elapsed and replay their
   * episodes sync. Exponential backoff is computed at markSyncFailed time
   * (1h → 4h → 12h → 24h → 48h, abandoned past attempt 5).
   */
  @Cron(CronExpression.EVERY_HOUR, { name: "sync-retry-failed" })
  async handleRetryFailed(): Promise<void> {
    if (!this.enabled) return;
    await this.runContext.run("sync-retry-failed", async () => {
      const runId = this.runContext.runId();
      try {
        const result = await this.retryFailed.execute({});
        if (result.attempted > 0) {
          this.logger.log(
            `[run=${runId}] Retry pass: ${result.succeeded} succeeded / ${result.failed} re-failed / ${result.attempted} attempted`,
          );
        }
      } catch (err) {
        this.logger.warn(`[run=${runId}] Retry pass failed: ${(err as Error).message}`);
      }
    });
  }
}
