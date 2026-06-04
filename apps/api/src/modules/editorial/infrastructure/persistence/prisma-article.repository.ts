import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ArticleDetailView,
  ArticleRepositoryPort,
  ArticleSummaryView,
} from "../../domain/ports/article-repository.port";

const ARTICLE_INCLUDE = {
  author: { select: { name: true } },
} satisfies Prisma.ArticleInclude;

type ArticleRow = Prisma.ArticleGetPayload<{ include: typeof ARTICLE_INCLUDE }>;

@Injectable()
export class PrismaArticleRepository implements ArticleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(limit: number): Promise<ArticleSummaryView[]> {
    const rows = await this.prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: ARTICLE_INCLUDE,
    });
    return rows.map((row) => this.toSummaryView(row));
  }

  async getPublishedBySlug(slug: string): Promise<ArticleDetailView | null> {
    const row = await this.prisma.article.findFirst({
      where: { slug, published: true },
      include: ARTICLE_INCLUDE,
    });
    if (!row) return null;
    return { ...this.toSummaryView(row), body: row.body };
  }

  async create(input: {
    slug: string;
    title: string;
    kicker: string | null;
    excerpt: string | null;
    body: string;
    coverUrl: string | null;
    authorId: string;
    publish: boolean;
  }): Promise<string> {
    const article = await this.prisma.article.create({
      data: {
        slug: input.slug,
        title: input.title,
        kicker: input.kicker,
        excerpt: input.excerpt,
        body: input.body,
        coverUrl: input.coverUrl,
        authorId: input.authorId,
        published: input.publish,
        publishedAt: input.publish ? new Date() : null,
      },
    });
    return article.slug;
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.article.count({ where: { slug } });
    return count > 0;
  }

  private toSummaryView(row: ArticleRow): ArticleSummaryView {
    return {
      slug: row.slug,
      title: row.title,
      kicker: row.kicker,
      excerpt: row.excerpt,
      coverUrl: row.coverUrl,
      authorName: row.author.name,
      publishedAt: row.publishedAt,
    };
  }
}
