import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";
import { ListGenresUseCase } from "./application/use-cases/list-genres.use-case";
import { GetGenreDetailUseCase } from "./application/use-cases/get-genre-detail.use-case";
import { GENRE_REPOSITORY } from "./application/tokens";
import { PrismaGenreRepository } from "./infrastructure/persistence/prisma-genre.repository";
import { GenreController } from "./infrastructure/http/genre.controller";

@Module({
  imports: [PrismaModule, forwardRef(() => AnimeModule)],
  controllers: [GenreController],
  providers: [
    ListGenresUseCase,
    GetGenreDetailUseCase,
    { provide: GENRE_REPOSITORY, useClass: PrismaGenreRepository },
  ],
  exports: [GENRE_REPOSITORY],
})
export class GenreModule {}
