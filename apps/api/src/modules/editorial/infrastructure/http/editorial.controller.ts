import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { ArticleDetailDto, ArticleSummaryDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { AdminRequiredGuard } from "@auth/admin-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { ListArticlesUseCase } from "../../application/use-cases/list-articles.use-case";
import { GetArticleUseCase } from "../../application/use-cases/get-article.use-case";
import { CreateArticleUseCase } from "../../application/use-cases/create-article.use-case";
import { ArticleMapper } from "../../application/mappers/article.mapper";
import { ArticlesQueryDto, CreateArticleDto } from "../../application/dtos/article.dto";

@Controller("articles")
export class EditorialController {
  constructor(
    private readonly listArticles: ListArticlesUseCase,
    private readonly getArticle: GetArticleUseCase,
    private readonly createArticle: CreateArticleUseCase,
  ) {}

  @Get()
  async list(@Query() query: ArticlesQueryDto): Promise<ArticleSummaryDto[]> {
    const articles = await this.listArticles.execute({ limit: query.limit });
    return articles.map((article) => ArticleMapper.toSummaryDto(article));
  }

  @Get(":slug")
  async detail(@Param("slug") slug: string): Promise<ArticleDetailDto> {
    const article = await this.getArticle.execute({ slug });
    return ArticleMapper.toDetailDto(article);
  }

  @Post()
  @UseGuards(AuthRequiredGuard, AdminRequiredGuard)
  @HttpCode(201)
  async create(
    @CurrentUserId() authorId: string,
    @Body() body: CreateArticleDto,
  ): Promise<{ slug: string }> {
    return this.createArticle.execute({
      authorId,
      title: body.title,
      kicker: body.kicker,
      excerpt: body.excerpt,
      body: body.body,
      coverUrl: body.coverUrl,
      publish: body.publish,
    });
  }
}
