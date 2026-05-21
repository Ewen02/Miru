import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { EpisodeLinkRepositoryPort } from "../../domain/ports/episode-link-repository.port";
import { EpisodePlatformLinkEntity } from "../../domain/entities/episode-platform-link.entity";
import { EPISODE_LINK_REPOSITORY } from "../tokens";

interface Input {
  episodeId: string;
}

/**
 * Read use case. ALWAYS returns [] when ENABLE_SCRAPERS is false — even
 * if rows exist (left over from prior activation). The flag check happens
 * here so the controller can stay unaware.
 */
@Injectable()
export class ListEpisodeLinksUseCase
  implements UseCase<Input, EpisodePlatformLinkEntity[]>
{
  constructor(
    @Inject(EPISODE_LINK_REPOSITORY)
    private readonly repo: EpisodeLinkRepositoryPort,
  ) {}

  async execute({ episodeId }: Input): Promise<EpisodePlatformLinkEntity[]> {
    if (process.env.ENABLE_SCRAPERS !== "true") return [];
    return this.repo.findByEpisodeId(episodeId);
  }
}
