import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { BillingProviderPort } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { BILLING_PROVIDER, BILLING_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  returnUrl: string;
}

interface Output {
  url: string;
}

@Injectable()
export class OpenPortalUseCase implements UseCase<Input, Output> {
  constructor(
    @Inject(BILLING_REPOSITORY) private readonly repo: BillingRepositoryPort,
    @Inject(BILLING_PROVIDER) private readonly provider: BillingProviderPort,
  ) {}

  async execute({ userId, returnUrl }: Input): Promise<Output> {
    const state = await this.repo.findByUserId(userId);
    if (!state?.stripeCustomerId) {
      throw new NotFoundException("Aucun abonnement Stripe pour cet utilisateur.");
    }
    const session = await this.provider.createBillingPortalSession({
      customerId: state.stripeCustomerId,
      returnUrl,
    });
    return { url: session.url };
  }
}
