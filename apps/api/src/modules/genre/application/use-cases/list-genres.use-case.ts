import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { GenreEntity } from "../../domain/entities/genre.entity";
import { GenreRepositoryPort } from "../../domain/ports/genre-repository.port";
import { GENRE_REPOSITORY } from "../tokens";

@Injectable()
export class ListGenresUseCase implements UseCase<void, GenreEntity[]> {
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly repo: GenreRepositoryPort,
  ) {}

  async execute(): Promise<GenreEntity[]> {
    return this.repo.findAll();
  }
}
