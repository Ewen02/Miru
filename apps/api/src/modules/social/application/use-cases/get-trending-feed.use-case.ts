import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ActivityEventView,
  ActivityRepositoryPort,
} from "../../domain/ports/activity-repository.port";
import { ACTIVITY_REPOSITORY } from "../tokens";

interface Input {
  limit?: number;
}

const DEFAULT_LIMIT = 30;

/**
 * Global activity feed (trending) across all users — public, no auth required.
 */
@Injectable()
export class GetTrendingFeedUseCase implements UseCase<Input, ActivityEventView[]> {
  constructor(@Inject(ACTIVITY_REPOSITORY) private readonly activity: ActivityRepositoryPort) {}

  execute({ limit }: Input): Promise<ActivityEventView[]> {
    return this.activity.feedGlobal(limit ?? DEFAULT_LIMIT);
  }
}
