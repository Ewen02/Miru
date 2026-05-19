import { Injectable, Inject, BadRequestException, ConflictException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { slugify } from "@shared/utils/slugify";
import {
  ListRepositoryPort,
} from "../../domain/ports/list-repository.port";
import { ListEntity } from "../../domain/entities/list.entity";
import { LIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  title: string;
  description?: string | null;
  isPublic?: boolean;
}

@Injectable()
export class CreateListUseCase implements UseCase<Input, ListEntity> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, title, description, isPublic }: Input): Promise<ListEntity> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      throw new BadRequestException("Title must be at least 2 characters");
    }
    if (trimmedTitle.length > 80) {
      throw new BadRequestException("Title must be 80 characters or less");
    }

    const slug = slugify(trimmedTitle);
    if (!slug) throw new BadRequestException("Title produces an empty slug");

    try {
      return await this.repo.create({
        userId,
        title: trimmedTitle,
        description: description ?? null,
        slug,
        isPublic: isPublic ?? true,
      });
    } catch (err) {
      // Per-user slug uniqueness violation surfaces as a Prisma P2002.
      if ((err as { code?: string }).code === "P2002") {
        throw new ConflictException("You already have a list with that name");
      }
      throw err;
    }
  }
}
