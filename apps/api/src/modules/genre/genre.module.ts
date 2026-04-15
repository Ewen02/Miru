import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListGenresUseCase } from "./application/use-cases/list-genres.use-case";
import { GENRE_REPOSITORY } from "./application/tokens";
import { PrismaGenreRepository } from "./infrastructure/persistence/prisma-genre.repository";
import { GenreController } from "./infrastructure/http/genre.controller";

@Module({
  imports: [PrismaModule],
  controllers: [GenreController],
  providers: [ListGenresUseCase, { provide: GENRE_REPOSITORY, useClass: PrismaGenreRepository }],
  exports: [GENRE_REPOSITORY],
})
export class GenreModule {}
