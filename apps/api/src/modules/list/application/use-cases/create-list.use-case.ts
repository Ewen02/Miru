import { Injectable, Inject } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { slugify } from "@shared/utils/slugify";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
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
      throw new ValidationException("Title must be at least 2 characters");
    }
    if (trimmedTitle.length > 80) {
      throw new ValidationException("Title must be 80 characters or less");
    }

    const slug = slugify(trimmedTitle);
    if (!slug) throw new ValidationException("Title produces an empty slug");

    return this.repo.create({
      userId,
      title: trimmedTitle,
      description: description ?? null,
      slug,
      isPublic: isPublic ?? true,
    });
  }
}
