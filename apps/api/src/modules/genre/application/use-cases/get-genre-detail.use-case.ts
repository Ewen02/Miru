import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PaginatedResult } from "@shared/domain/repository.port";
import { AnimeEntity } from "@modules/anime/domain/entities/anime.entity";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { ANIME_REPOSITORY } from "@modules/anime/application/tokens";
import { GenreEntity } from "../../domain/entities/genre.entity";
import { GenreRepositoryPort, GenreStats } from "../../domain/ports/genre-repository.port";
import { GENRE_REPOSITORY } from "../tokens";

interface GetGenreDetailInput {
  slug: string;
  page: number;
  pageSize: number;
}

interface GetGenreDetailOutput {
  genre: GenreEntity;
  stats: GenreStats;
  animes: PaginatedResult<AnimeEntity>;
}

@Injectable()
export class GetGenreDetailUseCase
  implements UseCase<GetGenreDetailInput, GetGenreDetailOutput>
{
  constructor(
    @Inject(GENRE_REPOSITORY) private readonly genres: GenreRepositoryPort,
    @Inject(ANIME_REPOSITORY) private readonly animes: AnimeRepositoryPort,
  ) {}

  async execute({ slug, page, pageSize }: GetGenreDetailInput): Promise<GetGenreDetailOutput> {
    const genre = await this.genres.findBySlug(slug);
    if (!genre) throw new NotFoundException(`Genre "${slug}" not found`);

    const [stats, animes] = await Promise.all([
      this.genres.statsBySlug(slug),
      this.animes.findByFilters({ genres: [slug] }, { page, pageSize }),
    ]);

    return { genre, stats, animes };
  }
}
