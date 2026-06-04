import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { EpisodeReactionRepositoryPort } from "../../domain/ports/episode-reaction-repository.port";
import { EPISODE_REACTION_REPOSITORY } from "../tokens";

const VALID_KINDS = ["love", "laugh", "cry", "shock", "fire"];
const MAX_SECOND_MARK = 14_400; // 4h cap

interface Input {
  episodeId: string;
  userId: string;
  secondMark: number;
  kind: string;
}

@Injectable()
export class AddEpisodeReactionUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(EPISODE_REACTION_REPOSITORY)
    private readonly reactionRepo: EpisodeReactionRepositoryPort,
  ) {}

  async execute({ episodeId, userId, secondMark, kind }: Input): Promise<void> {
    if (!VALID_KINDS.includes(kind)) {
      throw new ValidationException("Type de réaction invalide.");
    }

    if (!Number.isInteger(secondMark) || secondMark < 0 || secondMark > MAX_SECOND_MARK) {
      throw new ValidationException("Position invalide dans l'épisode.");
    }

    const exists = await this.reactionRepo.episodeExists(episodeId);
    if (!exists) {
      throw new NotFoundException("Episode", episodeId);
    }

    await this.reactionRepo.addReaction(episodeId, userId, secondMark, kind);
  }
}
