import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException, ForbiddenException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  listId: string;
  action: "like" | "unlike";
}

@Injectable()
export class ToggleListLikeUseCase implements UseCase<Input, void> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, listId, action }: Input): Promise<void> {
    const list = await this.repo.findById(listId);
    if (!list) throw new NotFoundException("List not found");
    if (!list.isPublic && list.userId !== userId) {
      throw new ForbiddenException("List is private");
    }

    if (action === "like") {
      await this.repo.like(userId, listId);
    } else {
      await this.repo.unlike(userId, listId);
    }
  }
}
