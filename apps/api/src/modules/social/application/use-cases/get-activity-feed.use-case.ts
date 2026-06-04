import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ActivityEventView,
  ActivityRepositoryPort,
} from "../../domain/ports/activity-repository.port";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { ACTIVITY_REPOSITORY, FOLLOW_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 30;

interface Input {
  userId: string;
  limit?: number;
}

@Injectable()
export class GetActivityFeedUseCase implements UseCase<Input, ActivityEventView[]> {
  constructor(
    @Inject(FOLLOW_REPOSITORY) private readonly followRepo: FollowRepositoryPort,
    @Inject(ACTIVITY_REPOSITORY) private readonly activityRepo: ActivityRepositoryPort,
  ) {}

  async execute({ userId, limit }: Input): Promise<ActivityEventView[]> {
    const following = await this.followRepo.listFollowing(userId);
    return this.activityRepo.feedForUsers([...following, userId], limit ?? DEFAULT_LIMIT);
  }
}
