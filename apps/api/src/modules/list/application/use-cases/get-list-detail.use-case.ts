import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException, ForbiddenException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ListRepositoryPort,
  ListWithItems,
} from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

interface Input {
  listId: string;
  /** Viewer user id (null for anonymous). Drives visibility + liked flag. */
  viewerUserId: string | null;
}

interface Output {
  detail: ListWithItems;
  likedByViewer: boolean;
  ownedByViewer: boolean;
}

@Injectable()
export class GetListDetailUseCase implements UseCase<Input, Output> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute({ listId, viewerUserId }: Input): Promise<Output> {
    const detail = await this.repo.findWithItems(listId);
    if (!detail) throw new NotFoundException(`List "${listId}" not found`);

    const ownedByViewer = viewerUserId != null && detail.list.userId === viewerUserId;
    if (!detail.list.isPublic && !ownedByViewer) {
      throw new ForbiddenException("List is private");
    }

    const likedByViewer =
      viewerUserId != null ? await this.repo.isLikedBy(viewerUserId, listId) : false;

    return { detail, likedByViewer, ownedByViewer };
  }
}
