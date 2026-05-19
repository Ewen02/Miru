import { Injectable, Inject, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  listId: string;
}

@Injectable()
export class DeleteListUseCase implements UseCase<Input, void> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, listId }: Input): Promise<void> {
    const list = await this.repo.findById(listId);
    if (!list) throw new NotFoundException("List not found");
    if (list.userId !== userId) throw new ForbiddenException("Not the list owner");
    await this.repo.delete(listId);
  }
}
