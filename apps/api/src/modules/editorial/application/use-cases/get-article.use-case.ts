import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ArticleDetailView,
  ArticleRepositoryPort,
} from "../../domain/ports/article-repository.port";
import { ARTICLE_REPOSITORY } from "../tokens";

interface Input {
  slug: string;
}

@Injectable()
export class GetArticleUseCase implements UseCase<Input, ArticleDetailView> {
  constructor(@Inject(ARTICLE_REPOSITORY) private readonly articleRepo: ArticleRepositoryPort) {}

  async execute({ slug }: Input): Promise<ArticleDetailView> {
    const article = await this.articleRepo.getPublishedBySlug(slug);
    if (!article) {
      throw new NotFoundException("Article", slug);
    }
    return article;
  }
}
