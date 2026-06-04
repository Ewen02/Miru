import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ForumRepositoryPort,
  ForumThreadDetailView,
} from "../../domain/ports/forum-repository.port";
import { FORUM_REPOSITORY } from "../tokens";

const CATEGORIES = ["GENERAL", "RECOMMENDATIONS", "NEWS", "HELP", "OFFTOPIC"];

interface Input {
  authorId: string;
  title: string;
  category: string;
  body: string;
}

@Injectable()
export class CreateForumThreadUseCase implements UseCase<Input, ForumThreadDetailView> {
  constructor(@Inject(FORUM_REPOSITORY) private readonly forumRepo: ForumRepositoryPort) {}

  async execute({ authorId, title, category, body }: Input): Promise<ForumThreadDetailView> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      throw new ValidationException("Le titre doit contenir entre 1 et 200 caractères.");
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length < 1 || trimmedBody.length > 5000) {
      throw new ValidationException("Le message doit contenir entre 1 et 5000 caractères.");
    }

    if (!CATEGORIES.includes(category)) {
      throw new ValidationException("Catégorie de forum invalide.");
    }

    const threadId = await this.forumRepo.createThread({
      title: trimmedTitle,
      category,
      authorId,
      body: trimmedBody,
    });

    const thread = await this.forumRepo.getThread(threadId);
    if (!thread) {
      throw new NotFoundException("ForumThread", threadId);
    }
    return thread;
  }
}
