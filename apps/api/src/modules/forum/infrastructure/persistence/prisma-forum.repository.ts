import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ForumRepositoryPort,
  ForumThreadDetailView,
  ForumThreadSummaryView,
} from "../../domain/ports/forum-repository.port";

const THREAD_DETAIL_INCLUDE = {
  author: { select: { name: true } },
  posts: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, image: true } } },
  },
} satisfies Prisma.ForumThreadInclude;

type ThreadDetailRow = Prisma.ForumThreadGetPayload<{ include: typeof THREAD_DETAIL_INCLUDE }>;

@Injectable()
export class PrismaForumRepository implements ForumRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listThreads(category: string | null, limit: number): Promise<ForumThreadSummaryView[]> {
    const rows = await this.prisma.forumThread.findMany({
      where: category ? { category: category as Prisma.EnumForumCategoryFilter["equals"] } : {},
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        author: { select: { name: true } },
        _count: { select: { posts: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      authorName: row.author.name,
      postCount: row._count.posts,
      updatedAt: row.updatedAt,
    }));
  }

  async getThread(threadId: string): Promise<ForumThreadDetailView | null> {
    const row = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
      include: THREAD_DETAIL_INCLUDE,
    });
    if (!row) return null;
    return this.toDetailView(row);
  }

  async createThread(input: {
    title: string;
    category: string;
    authorId: string;
    body: string;
  }): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      const thread = await tx.forumThread.create({
        data: {
          title: input.title,
          category: input.category as Prisma.ForumThreadCreateInput["category"],
          authorId: input.authorId,
        },
      });
      await tx.forumPost.create({
        data: {
          threadId: thread.id,
          authorId: input.authorId,
          body: input.body,
        },
      });
      return thread.id;
    });
  }

  async addPost(threadId: string, authorId: string, body: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.forumPost.create({ data: { threadId, authorId, body } }),
      this.prisma.forumThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }

  async threadExists(threadId: string): Promise<boolean> {
    const count = await this.prisma.forumThread.count({ where: { id: threadId } });
    return count > 0;
  }

  private toDetailView(row: ThreadDetailRow): ForumThreadDetailView {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      authorName: row.author.name,
      createdAt: row.createdAt,
      posts: row.posts.map((post) => ({
        id: post.id,
        body: post.body,
        createdAt: post.createdAt,
        author: {
          id: post.author.id,
          name: post.author.name,
          image: post.author.image,
        },
      })),
    };
  }
}
