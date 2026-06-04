import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ForumRepositoryPort,
  ForumThreadSummaryView,
} from "../../domain/ports/forum-repository.port";
import { FORUM_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 30;
const CATEGORIES = ["GENERAL", "RECOMMENDATIONS", "NEWS", "HELP", "OFFTOPIC"];

interface Input {
  category?: string | null;
  limit?: number;
}

@Injectable()
export class ListForumThreadsUseCase implements UseCase<Input, ForumThreadSummaryView[]> {
  constructor(@Inject(FORUM_REPOSITORY) private readonly forumRepo: ForumRepositoryPort) {}

  async execute({ category, limit }: Input): Promise<ForumThreadSummaryView[]> {
    const filter = category != null && CATEGORIES.includes(category) ? category : null;
    return this.forumRepo.listThreads(filter, limit ?? DEFAULT_LIMIT);
  }
}
