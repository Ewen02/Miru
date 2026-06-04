import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { PollRepositoryPort, PollWithViewerVote } from "../../domain/ports/poll-repository.port";
import { POLL_REPOSITORY } from "../tokens";

interface Input {
  pollId: string;
  optionId: string;
  userId: string;
}

@Injectable()
export class VoteOnPollUseCase implements UseCase<Input, PollWithViewerVote> {
  constructor(@Inject(POLL_REPOSITORY) private readonly pollRepo: PollRepositoryPort) {}

  async execute({ pollId, optionId, userId }: Input): Promise<PollWithViewerVote> {
    const result = await this.pollRepo.getPoll(pollId, userId);
    if (!result) {
      throw new NotFoundException("Poll", pollId);
    }

    const { poll } = result;
    if (poll.closesAt != null && poll.closesAt.getTime() < Date.now()) {
      throw new ValidationException("Ce sondage est clos.");
    }

    const option = poll.options.find((candidate) => candidate.id === optionId);
    if (!option) {
      throw new NotFoundException("PollOption", optionId);
    }

    await this.pollRepo.vote(pollId, optionId, userId);

    // Re-fetch so the caller gets the updated tallies + the viewer's new vote.
    const updated = await this.pollRepo.getPoll(pollId, userId);
    if (!updated) throw new NotFoundException("Poll", pollId);
    return updated;
  }
}
