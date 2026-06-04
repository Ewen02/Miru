import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { slugify } from "@shared/utils/slugify";
import { LIST_CREATED_EVENT, type ListCreatedPayload } from "@shared/events/activity.events";
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
  constructor(
    @Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

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

    const list = await this.repo.create({
      userId,
      title: trimmedTitle,
      description: description ?? null,
      slug,
      isPublic: isPublic ?? true,
    });

    this.events.emit(LIST_CREATED_EVENT, {
      userId,
      listId: list.id,
    } satisfies ListCreatedPayload);

    return list;
  }
}
