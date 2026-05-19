import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ListRepositoryPort,
  ListSummary,
} from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  filter: "mine" | "liked" | "public";
}

const PUBLIC_LIMIT = 24;

@Injectable()
export class ListUserListsUseCase implements UseCase<Input, ListSummary[]> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ userId, filter }: Input): Promise<ListSummary[]> {
    if (filter === "mine") return this.repo.findByUserId(userId);
    if (filter === "liked") return this.repo.findLikedByUserId(userId);
    return this.repo.findPublic(PUBLIC_LIMIT);
  }
}
