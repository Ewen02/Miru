import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  AnimeRepositoryPort,
  EpisodeAiringRow,
} from "../../domain/ports/anime-repository.port";
import { ANIME_REPOSITORY } from "../tokens";

interface GetCalendarWeekInput {
  /** Inclusive start of the window. */
  from: Date;
  /** Exclusive end of the window. */
  to: Date;
}

interface GetCalendarWeekOutput {
  from: string;
  to: string;
  episodes: EpisodeAiringRow[];
}

@Injectable()
export class GetCalendarWeekUseCase
  implements UseCase<GetCalendarWeekInput, GetCalendarWeekOutput>
{
  constructor(
    @Inject(ANIME_REPOSITORY) private readonly repo: AnimeRepositoryPort,
  ) {}

  async execute({ from, to }: GetCalendarWeekInput): Promise<GetCalendarWeekOutput> {
    const episodes = await this.repo.findAiringEpisodesBetween(from, to);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      episodes,
    };
  }
}
