import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListForumThreadsUseCase } from "./application/use-cases/list-forum-threads.use-case";
import { GetForumThreadUseCase } from "./application/use-cases/get-forum-thread.use-case";
import { CreateForumThreadUseCase } from "./application/use-cases/create-forum-thread.use-case";
import { AddForumPostUseCase } from "./application/use-cases/add-forum-post.use-case";
import { FORUM_REPOSITORY } from "./application/tokens";
import { PrismaForumRepository } from "./infrastructure/persistence/prisma-forum.repository";
import { ForumController } from "./infrastructure/http/forum.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ForumController],
  providers: [
    ListForumThreadsUseCase,
    GetForumThreadUseCase,
    CreateForumThreadUseCase,
    AddForumPostUseCase,
    { provide: FORUM_REPOSITORY, useClass: PrismaForumRepository },
  ],
  exports: [FORUM_REPOSITORY],
})
export class ForumModule {}
