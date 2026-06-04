import type { ArticleDetailDto, ArticleSummaryDto } from "@miru/types";
import { ArticleDetailView, ArticleSummaryView } from "../../domain/ports/article-repository.port";

export class ArticleMapper {
  static toSummaryDto(view: ArticleSummaryView): ArticleSummaryDto {
    return {
      slug: view.slug,
      title: view.title,
      kicker: view.kicker,
      excerpt: view.excerpt,
      coverUrl: view.coverUrl,
      authorName: view.authorName,
      publishedAt: view.publishedAt ? view.publishedAt.toISOString() : null,
    };
  }

  static toDetailDto(view: ArticleDetailView): ArticleDetailDto {
    return {
      ...ArticleMapper.toSummaryDto(view),
      body: view.body,
    };
  }
}
