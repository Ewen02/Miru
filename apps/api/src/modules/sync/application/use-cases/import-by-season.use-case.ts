import { Injectable, Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { AnimeSyncPort, MediaSeason } from "@modules/anime/domain/ports/anime-sync.port";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { ANIME_SYNC, ANIME_REPOSITORY } from "@modules/anime/application/tokens";

interface ImportBySeasonInput {
  season: MediaSeason;
  seasonYear: number;
  pages: number;
  perPage: number;
}

interface ImportBySeasonOutput {
  imported: number;
  pagesFetched: number;
}

@Injectable()
export class ImportBySeasonUseCase implements UseCase<ImportBySeasonInput, ImportBySeasonOutput> {
  private readonly logger = new Logger(ImportBySeasonUseCase.name);

  constructor(
    @Inject(ANIME_SYNC) private readonly sync: AnimeSyncPort,
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
  ) {}

  async execute({
    season,
    seasonYear,
    pages,
    perPage,
  }: ImportBySeasonInput): Promise<ImportBySeasonOutput> {
    let imported = 0;
    let pagesFetched = 0;

    for (let page = 1; page <= pages; page++) {
      const entities = await this.sync.fetchBySeason(season, seasonYear, page, perPage);
      pagesFetched++;

      if (entities.length === 0) break;

      for (const entity of entities) {
        await this.repo.save(entity);
      }
      imported += entities.length;

      this.logger.log(
        `${season} ${seasonYear} — page ${page}/${pages}: ${entities.length} anime imported (total ${imported})`,
      );
    }

    return { imported, pagesFetched };
  }
}
