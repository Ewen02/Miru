import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
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

@Injectable()
export class ImportTrendingUseCase implements UseCase<ImportTrendingInput, ImportTrendingOutput> {
  private readonly logger = new Logger(ImportTrendingUseCase.name);

  constructor(
    @Inject(ANIME_SYNC) private readonly sync: AnimeSyncPort,
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
  ) {}

  async execute({ pages, perPage }: ImportTrendingInput): Promise<ImportTrendingOutput> {
    let imported = 0;
    let pagesFetched = 0;

    for (let page = 1; page <= pages; page++) {
      const entities = await this.sync.fetchTrending(page, perPage);
      pagesFetched++;

      if (entities.length === 0) break;

      for (const entity of entities) {
        await this.repo.save(entity);
      }
      imported += entities.length;

      this.logger.log(
        `Page ${page}/${pages}: ${entities.length} anime imported (total ${imported})`,
      );
    }

    return { imported, pagesFetched };
  }
}
