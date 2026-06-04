import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  EpisodeReactionRepositoryPort,
  ReactionTally,
} from "../../domain/ports/episode-reaction-repository.port";
import { EPISODE_REACTION_REPOSITORY } from "../tokens";

const DEFAULT_BUCKET_SECONDS = 30;
const MIN_BUCKET_SECONDS = 5;
const MAX_BUCKET_SECONDS = 300;

interface Input {
  episodeId: string;
  bucketSeconds?: number;
}

@Injectable()
export class GetEpisodeHeatmapUseCase implements UseCase<Input, ReactionTally> {
  constructor(
    @Inject(EPISODE_REACTION_REPOSITORY)
    private readonly reactionRepo: EpisodeReactionRepositoryPort,
  ) {}

  async execute({ episodeId, bucketSeconds }: Input): Promise<ReactionTally> {
    const bucket = Math.min(
      MAX_BUCKET_SECONDS,
      Math.max(MIN_BUCKET_SECONDS, bucketSeconds ?? DEFAULT_BUCKET_SECONDS),
    );

    const exists = await this.reactionRepo.episodeExists(episodeId);
    if (!exists) {
      throw new NotFoundException("Episode", episodeId);
    }

    return this.reactionRepo.heatmap(episodeId, bucket);
  }
}
