import { GenreEntity } from "../entities/genre.entity";

export interface GenreRepositoryPort {
  findAll(): Promise<GenreEntity[]>;
}
