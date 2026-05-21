import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { BillingProviderPort, WebhookEvent } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { BILLING_PROVIDER, BILLING_REPOSITORY } from "../tokens";

interface Input {
  rawBody: Buffer;
  signature: string;
}

/**
 * Processes Stripe webhook events. The provider verifies the signature;
 * this use case only reacts to the events that matter for our minimal model:
 * activate on checkout.session.completed + customer.subscription.updated,
 * cancel on customer.subscription.deleted.
 */
@Injectable()
export class HandleWebhookUseCase implements UseCase<Input, void> {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @Inject(BILLING_REPOSITORY) private readonly repo: BillingRepositoryPort,
    @Inject(BILLING_PROVIDER) private readonly provider: BillingProviderPort,
  ) {}

  async execute({ rawBody, signature }: Input): Promise<void> {
    const event = this.provider.parseWebhook(rawBody, signature);
    await this.apply(event);
  }

  private async apply(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const obj = event.data as {
          customer?: string;
          subscription?: string;
          id?: string;
          status?: string;
        };
        const customerId = typeof obj.customer === "string" ? obj.customer : null;
        const subscriptionId =
          typeof obj.subscription === "string"
            ? obj.subscription
            : typeof obj.id === "string"
              ? obj.id
              : null;
        if (!customerId || !subscriptionId) return;
        // Treat any non-cancelled active-ish status as Pro.
        if (obj.status && ["canceled", "unpaid", "incomplete_expired"].includes(obj.status)) {
          await this.repo.cancelSubscription(customerId);
          return;
        }
        await this.repo.activateSubscription(customerId, subscriptionId, new Date());
        return;
      }
      case "customer.subscription.deleted": {
        const obj = event.data as { customer?: string };
        if (typeof obj.customer === "string") {
          await this.repo.cancelSubscription(obj.customer);
        }
        return;
      }
      default:
        this.logger.debug(`Ignored Stripe event: ${event.type}`);
    }
  }
}
