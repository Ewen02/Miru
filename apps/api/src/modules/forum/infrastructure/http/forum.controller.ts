import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { ForumThreadDetailDto, ForumThreadSummaryDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { ListForumThreadsUseCase } from "../../application/use-cases/list-forum-threads.use-case";
import { GetForumThreadUseCase } from "../../application/use-cases/get-forum-thread.use-case";
import { CreateForumThreadUseCase } from "../../application/use-cases/create-forum-thread.use-case";
import { AddForumPostUseCase } from "../../application/use-cases/add-forum-post.use-case";
import { ForumMapper } from "../../application/mappers/forum.mapper";
import { CreatePostDto, CreateThreadDto, ThreadsQueryDto } from "../../application/dtos/forum.dto";

@Controller("forum")
export class ForumController {
  constructor(
    private readonly listThreads: ListForumThreadsUseCase,
    private readonly getThread: GetForumThreadUseCase,
    private readonly createThread: CreateForumThreadUseCase,
    private readonly addPost: AddForumPostUseCase,
  ) {}

  @Get("threads")
  async list(@Query() query: ThreadsQueryDto): Promise<ForumThreadSummaryDto[]> {
    const threads = await this.listThreads.execute({
      category: query.category,
      limit: query.limit,
    });
    return threads.map((thread) => ForumMapper.toSummaryDto(thread));
  }

  @Get("threads/:id")
  async detail(@Param("id") threadId: string): Promise<ForumThreadDetailDto> {
    const thread = await this.getThread.execute({ threadId });
    return ForumMapper.toDetailDto(thread);
  }

  @Post("threads")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async create(
    @CurrentUserId() authorId: string,
    @Body() body: CreateThreadDto,
  ): Promise<ForumThreadDetailDto> {
    const thread = await this.createThread.execute({
      authorId,
      title: body.title,
      category: body.category,
      body: body.body,
    });
    return ForumMapper.toDetailDto(thread);
  }

  @Post("threads/:id/posts")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async post(
    @Param("id") threadId: string,
    @CurrentUserId() authorId: string,
    @Body() body: CreatePostDto,
  ): Promise<ForumThreadDetailDto> {
    const thread = await this.addPost.execute({ threadId, authorId, body: body.body });
    return ForumMapper.toDetailDto(thread);
  }
}
