import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { FollowRepositoryPort } from "../../domain/ports/follow-repository.port";
import { FOLLOW_REPOSITORY } from "../tokens";
import { USER_FOLLOWED_EVENT, type UserFollowedPayload } from "@shared/events/activity.events";

interface Input {
  followerId: string;
  targetId: string;
}

@Injectable()
export class FollowUserUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(FOLLOW_REPOSITORY) private readonly repo: FollowRepositoryPort,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ followerId, targetId }: Input): Promise<void> {
    if (followerId === targetId) {
      throw new ValidationException("On ne peut pas se suivre soi-même.");
    }
    await this.repo.follow(followerId, targetId);
    const payload: UserFollowedPayload = { followerId, followingId: targetId };
    this.events.emit(USER_FOLLOWED_EVENT, payload);
  }
}
