import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import StripeNS, { Stripe } from "stripe";
import {
  BillingCheckoutSession,
  BillingPortalSession,
  BillingProviderPort,
  WebhookEvent,
} from "../../domain/ports/billing-provider.port";

@Injectable()
export class StripeAdapter implements BillingProviderPort, OnModuleInit {
  private readonly logger = new Logger(StripeAdapter.name);
  private stripe: Stripe | null = null;
  private priceId: string | null = null;
  private webhookSecret: string | null = null;

  onModuleInit(): void {
    const key = process.env.STRIPE_SECRET_KEY;
    this.priceId = process.env.STRIPE_PRO_PRICE_ID ?? null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;
    if (!key) {
      this.logger.warn("STRIPE_SECRET_KEY missing — billing is disabled.");
      return;
    }
    this.stripe = new StripeNS(key, { apiVersion: "2026-04-22.dahlia" });
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }
    return this.stripe;
  }

  async ensureCustomer(input: { userId: string; email: string }): Promise<string> {
    const customer = await this.requireStripe().customers.create({
      email: input.email,
      metadata: { userId: input.userId },
    });
    return customer.id;
  }

  async createCheckoutSession(input: {
    customerId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<BillingCheckoutSession> {
    if (!this.priceId) {
      throw new Error("STRIPE_PRO_PRICE_ID missing.");
    }
    const session = await this.requireStripe().checkout.sessions.create({
      mode: "subscription",
      customer: input.customerId,
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: true,
    });
    return { url: session.url ?? "" };
  }

  async createBillingPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<BillingPortalSession> {
    const session = await this.requireStripe().billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }

  parseWebhook(rawBody: Buffer, signature: string): WebhookEvent {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET missing.");
    }
    const event = this.requireStripe().webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
    return { type: event.type, data: event.data.object };
  }
}
