import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  PushSubscriptionRecord,
  PushSubscriptionRepositoryPort,
} from "../../domain/ports/push-subscription.port";
import { PUSH_SUBSCRIPTION_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  subscription: PushSubscriptionRecord;
  userAgent: string | null;
}

@Injectable()
export class SubscribePushUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly repo: PushSubscriptionRepositoryPort,
  ) {}

  async execute({ userId, subscription, userAgent }: Input): Promise<void> {
    await this.repo.upsert(userId, subscription, userAgent);
  }
}
