import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { FOLLOW_REPOSITORY } from "../tokens";

interface Input {
  followerId: string;
  targetId: string;
}

@Injectable()
export class UnfollowUserUseCase implements UseCase<Input, void> {
  constructor(@Inject(FOLLOW_REPOSITORY) private readonly repo: FollowRepositoryPort) {}

  async execute({ followerId, targetId }: Input): Promise<void> {
    await this.repo.unfollow(followerId, targetId);
  }
}
