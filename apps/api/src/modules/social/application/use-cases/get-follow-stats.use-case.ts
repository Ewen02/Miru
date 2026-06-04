import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { FOLLOW_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  /** Viewer user id (null for anonymous). Drives the `isFollowing` flag. */
  viewerId?: string | null;
}

interface Output {
  followers: number;
  following: number;
  isFollowing: boolean;
}

@Injectable()
export class GetFollowStatsUseCase implements UseCase<Input, Output> {
  constructor(@Inject(FOLLOW_REPOSITORY) private readonly repo: FollowRepositoryPort) {}

  async execute({ userId, viewerId }: Input): Promise<Output> {
    const [followers, following] = await Promise.all([
      this.repo.countFollowers(userId),
      this.repo.countFollowing(userId),
    ]);

    const isFollowing =
      viewerId != null && viewerId !== userId
        ? await this.repo.isFollowing(viewerId, userId)
        : false;

    return { followers, following, isFollowing };
  }
}
