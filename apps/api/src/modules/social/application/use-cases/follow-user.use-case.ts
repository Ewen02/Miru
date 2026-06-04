import { Injectable, Inject } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { FOLLOW_REPOSITORY } from "../tokens";

interface Input {
  followerId: string;
  targetId: string;
}

@Injectable()
export class FollowUserUseCase implements UseCase<Input, void> {
  constructor(@Inject(FOLLOW_REPOSITORY) private readonly repo: FollowRepositoryPort) {}

  async execute({ followerId, targetId }: Input): Promise<void> {
    if (followerId === targetId) {
      throw new ValidationException("On ne peut pas se suivre soi-même.");
    }
    await this.repo.follow(followerId, targetId);
  }
}
