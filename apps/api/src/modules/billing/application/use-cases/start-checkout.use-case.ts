import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { BillingProviderPort } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { BILLING_PROVIDER, BILLING_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

interface Output {
  url: string;
}

/**
 * Creates a Stripe customer on first call, persists the id, then opens a
 * Checkout session for the subscription. Idempotent — calling twice reuses
 * the same customer.
 */
@Injectable()
export class StartCheckoutUseCase implements UseCase<Input, Output> {
  constructor(
    @Inject(BILLING_REPOSITORY) private readonly repo: BillingRepositoryPort,
    @Inject(BILLING_PROVIDER) private readonly provider: BillingProviderPort,
  ) {}

  async execute(input: Input): Promise<Output> {
    const state = await this.repo.findByUserId(input.userId);
    let customerId = state?.stripeCustomerId ?? null;
    if (!customerId) {
      customerId = await this.provider.ensureCustomer({
        userId: input.userId,
        email: input.email,
      });
      await this.repo.setCustomerId(input.userId, customerId);
    }

    const session = await this.provider.createCheckoutSession({
      customerId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
    return { url: session.url };
  }
}
