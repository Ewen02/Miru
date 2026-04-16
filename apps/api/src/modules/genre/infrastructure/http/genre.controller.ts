import { Controller, Get } from "@nestjs/common";
import type { GenreCard } from "@miru/types";
import { ListGenresUseCase } from "../../application/use-cases/list-genres.use-case";

@Controller("genres")
export class GenreController {
  constructor(private readonly listGenres: ListGenresUseCase) {}

  @Get()
  async list(): Promise<GenreCard[]> {
    const genres = await this.listGenres.execute();
    return genres.map((g) => ({ slug: g.slug, name: g.name }));
  }
}
