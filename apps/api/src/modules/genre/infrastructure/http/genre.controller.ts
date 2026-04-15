import { Controller, Get } from "@nestjs/common";
import { ListGenresUseCase } from "../../application/use-cases/list-genres.use-case";
import { GenreMapper } from "../../application/mappers/genre.mapper";

@Controller("genres")
export class GenreController {
  constructor(private readonly listGenres: ListGenresUseCase) {}

  @Get()
  async list() {
    const genres = await this.listGenres.execute();
    return GenreMapper.toCardList(genres);
  }
}
