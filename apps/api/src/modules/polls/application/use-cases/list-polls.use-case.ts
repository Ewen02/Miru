import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PollRepositoryPort, PollView } from "../../domain/ports/poll-repository.port";
import { POLL_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 30;

interface Input {
  viewerId?: string | null;
  limit?: number;
}

@Injectable()
export class ListPollsUseCase implements UseCase<
  Input,
  { poll: PollView; votedOptionId: string | null }[]
> {
  constructor(@Inject(POLL_REPOSITORY) private readonly pollRepo: PollRepositoryPort) {}

  async execute({
    viewerId,
    limit,
  }: Input): Promise<{ poll: PollView; votedOptionId: string | null }[]> {
    return this.pollRepo.listPolls(viewerId ?? null, limit ?? DEFAULT_LIMIT);
  }
}
