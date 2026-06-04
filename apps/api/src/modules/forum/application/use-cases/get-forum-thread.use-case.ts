import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ForumRepositoryPort,
  ForumThreadDetailView,
} from "../../domain/ports/forum-repository.port";
import { FORUM_REPOSITORY } from "../tokens";

interface Input {
  threadId: string;
}

@Injectable()
export class GetForumThreadUseCase implements UseCase<Input, ForumThreadDetailView> {
  constructor(@Inject(FORUM_REPOSITORY) private readonly forumRepo: ForumRepositoryPort) {}

  async execute({ threadId }: Input): Promise<ForumThreadDetailView> {
    const thread = await this.forumRepo.getThread(threadId);
    if (!thread) {
      throw new NotFoundException("ForumThread", threadId);
    }
    return thread;
  }
}
