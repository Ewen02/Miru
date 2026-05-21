import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PushSubscriptionRepositoryPort } from "../../domain/ports/push-subscription.port";
import { PUSH_SUBSCRIPTION_REPOSITORY } from "../tokens";

interface Input {
  endpoint: string;
}

@Injectable()
export class UnsubscribePushUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly repo: PushSubscriptionRepositoryPort,
  ) {}

  async execute({ endpoint }: Input): Promise<void> {
    await this.repo.deleteByEndpoint(endpoint);
  }
}
