import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListArticlesUseCase } from "./application/use-cases/list-articles.use-case";
import { GetArticleUseCase } from "./application/use-cases/get-article.use-case";
import { CreateArticleUseCase } from "./application/use-cases/create-article.use-case";
import { ARTICLE_REPOSITORY } from "./application/tokens";
import { PrismaArticleRepository } from "./infrastructure/persistence/prisma-article.repository";
import { EditorialController } from "./infrastructure/http/editorial.controller";

@Module({
  imports: [PrismaModule],
  controllers: [EditorialController],
  providers: [
    ListArticlesUseCase,
    GetArticleUseCase,
    CreateArticleUseCase,
    { provide: ARTICLE_REPOSITORY, useClass: PrismaArticleRepository },
  ],
  exports: [ARTICLE_REPOSITORY],
})
export class EditorialModule {}
