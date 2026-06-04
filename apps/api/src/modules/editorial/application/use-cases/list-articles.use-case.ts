import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ArticleRepositoryPort,
  ArticleSummaryView,
} from "../../domain/ports/article-repository.port";
import { ARTICLE_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 20;

interface Input {
  limit?: number;
}

@Injectable()
export class ListArticlesUseCase implements UseCase<Input, ArticleSummaryView[]> {
  constructor(@Inject(ARTICLE_REPOSITORY) private readonly articleRepo: ArticleRepositoryPort) {}

  async execute({ limit }: Input): Promise<ArticleSummaryView[]> {
    return this.articleRepo.listPublished(limit ?? DEFAULT_LIMIT);
  }
}
