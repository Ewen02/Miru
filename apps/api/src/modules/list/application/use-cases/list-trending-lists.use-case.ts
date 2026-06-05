import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { ListRepositoryPort, ListSummary } from "../../domain/ports/list-repository.port";
import { LIST_REPOSITORY } from "../tokens";

const TRENDING_LIMIT = 48;

/**
 * Public-facing trending lists ranked by likeCount. No auth — the page
 * sits on the discoverable surface of the app, alongside the catalogue.
 *
 * Separate use case from ListUserListsUseCase so the trending feed can
 * grow its own ranking signals (sponsored, isPromoted, freshness window)
 * without polluting the per-user list browsing path.
 */
@Injectable()
export class ListTrendingListsUseCase implements UseCase<void, ListSummary[]> {
  constructor(@Inject(LIST_REPOSITORY) private readonly repo: ListRepositoryPort) {}

  async execute(): Promise<ListSummary[]> {
    return this.repo.findTrending(TRENDING_LIMIT);
  }
}
