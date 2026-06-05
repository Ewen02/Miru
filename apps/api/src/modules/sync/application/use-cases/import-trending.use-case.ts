import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { concurrentMap } from "@shared/utils/concurrent-map";
import { RunContextService } from "@shared/infrastructure/context/run-context.service";
import { AnimeSyncPort } from "@modules/anime/domain/ports/anime-sync.port";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { ANIME_SYNC, ANIME_REPOSITORY } from "@modules/anime/application/tokens";

interface ImportTrendingInput {
  pages: number;
  perPage: number;
}

interface ImportTrendingOutput {
  imported: number;
  pagesFetched: number;
}

/**
 * Concurrency for the per-page `repo.save` fan-out. The HTTP fetch itself
 * is throttled by the singleton AniListClient (~750ms between requests),
 * so this only parallelises the DB-bound save. 5 is enough to keep the
 * connection pool busy without saturating it (CHANTIER-03 sets pool=10).
 */
const SAVE_CONCURRENCY = 5;

@Injectable()
export class ImportTrendingUseCase implements UseCase<ImportTrendingInput, ImportTrendingOutput> {
  private readonly logger = new Logger(ImportTrendingUseCase.name);

  constructor(
    @Inject(ANIME_SYNC) private readonly sync: AnimeSyncPort,
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
    private readonly runContext: RunContextService,
  ) {}

  async execute({ pages, perPage }: ImportTrendingInput): Promise<ImportTrendingOutput> {
    const runId = this.runContext.runId();
    let imported = 0;
    let pagesFetched = 0;

    for (let page = 1; page <= pages; page++) {
      const entities = await this.sync.fetchTrending(page, perPage);
      pagesFetched++;

      if (entities.length === 0) break;

      await concurrentMap(entities, SAVE_CONCURRENCY, (entity) => this.repo.save(entity));
      imported += entities.length;

      this.logger.log(
        `[run=${runId}] Page ${page}/${pages}: ${entities.length} anime imported (total ${imported})`,
      );
    }

    return { imported, pagesFetched };
  }
}
