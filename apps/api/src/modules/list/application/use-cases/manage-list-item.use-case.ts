import { Injectable, Inject, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ListRepositoryPort,
} from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

interface AddItemInput {
  userId: string;
  listId: string;
  animeId: string;
  note?: string | null;
}

interface RemoveItemInput {
  userId: string;
  listId: string;
  animeId: string;
}

@Injectable()
export class AddItemToListUseCase implements UseCase<AddItemInput, void> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, listId, animeId, note }: AddItemInput): Promise<void> {
    await this.assertOwnership(userId, listId);
    await this.repo.addItem(listId, animeId, note);
  }

  private async assertOwnership(userId: string, listId: string): Promise<void> {
    const list = await this.repo.findById(listId);
    if (!list) throw new NotFoundException("List not found");
    if (list.userId !== userId) throw new ForbiddenException("Not the list owner");
  }
}

@Injectable()
export class RemoveItemFromListUseCase implements UseCase<RemoveItemInput, void> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, listId, animeId }: RemoveItemInput): Promise<void> {
    const list = await this.repo.findById(listId);
    if (!list) throw new NotFoundException("List not found");
    if (list.userId !== userId) throw new ForbiddenException("Not the list owner");
    await this.repo.removeItem(listId, animeId);
  }
}
