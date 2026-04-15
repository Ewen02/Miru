import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { GenreRepositoryPort } from "../../domain/ports/genre-repository.port";
import { GenreEntity } from "../../domain/entities/genre.entity";

@Injectable()
export class PrismaGenreRepository implements GenreRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<GenreEntity[]> {
    const records = await this.prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
    return records.map((r) => GenreEntity.create(r.id, { name: r.name, slug: r.slug }));
  }
}
