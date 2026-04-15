import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ImportTrendingUseCase } from "../../application/use-cases/import-trending.use-case";
import { ImportEpisodesUseCase } from "../../application/use-cases/import-episodes.use-case";

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private readonly enabled = process.env.ENABLE_SCHEDULER === "true";

  constructor(
    private readonly importTrending: ImportTrendingUseCase,
    private readonly importEpisodes: ImportEpisodesUseCase,
  ) {}

  onModuleInit(): void {
    this.logger.log(`Scheduler ${this.enabled ? "ENABLED" : "DISABLED"} (ENABLE_SCHEDULER)`);
  }

  /** Quotidien à 4h UTC : rafraîchit le catalogue trending. */
  @Cron("0 4 * * *", { name: "sync-trending-daily" })
  async handleTrendingDaily(): Promise<void> {
    if (!this.enabled) return;
    this.logger.log("Cron tick: sync:trending");
    try {
      const result = await this.importTrending.execute({ pages: 3, perPage: 20 });
      this.logger.log(
        `Trending sync done: ${result.imported} imported across ${result.pagesFetched} pages`,
      );
    } catch (err) {
      this.logger.warn(`Trending sync failed: ${(err as Error).message}`);
    }
  }

  /** Horaire : rafraîchit les épisodes des animes en cours de diffusion. */
  @Cron(CronExpression.EVERY_HOUR, { name: "sync-episodes-airing" })
  async handleEpisodesHourly(): Promise<void> {
    if (!this.enabled) return;
    this.logger.log("Cron tick: sync:episodes airingOnly");
    try {
      const result = await this.importEpisodes.execute({ airingOnly: true });
      this.logger.log(
        `Airing episodes sync done: ${result.episodesImported} episodes across ${result.animesProcessed} anime (skipped ${result.skipped})`,
      );
    } catch (err) {
      this.logger.warn(`Episodes sync failed: ${(err as Error).message}`);
    }
  }
}
