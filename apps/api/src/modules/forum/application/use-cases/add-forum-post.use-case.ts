import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ForumRepositoryPort,
  ForumThreadDetailView,
} from "../../domain/ports/forum-repository.port";
import { FORUM_REPOSITORY } from "../tokens";

interface Input {
  threadId: string;
  authorId: string;
  body: string;
}

@Injectable()
export class AddForumPostUseCase implements UseCase<Input, ForumThreadDetailView> {
  constructor(@Inject(FORUM_REPOSITORY) private readonly forumRepo: ForumRepositoryPort) {}

  async execute({ threadId, authorId, body }: Input): Promise<ForumThreadDetailView> {
    const trimmedBody = body.trim();
    if (trimmedBody.length < 1 || trimmedBody.length > 5000) {
      throw new ValidationException("Le message doit contenir entre 1 et 5000 caractères.");
    }

    const exists = await this.forumRepo.threadExists(threadId);
    if (!exists) {
      throw new NotFoundException("ForumThread", threadId);
    }

    await this.forumRepo.addPost(threadId, authorId, trimmedBody);

    const thread = await this.forumRepo.getThread(threadId);
    if (!thread) {
      throw new NotFoundException("ForumThread", threadId);
    }
    return thread;
  }
}
