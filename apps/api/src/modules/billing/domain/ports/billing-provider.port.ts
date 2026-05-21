/**
 * Out port to the payment provider (Stripe in the only implementation).
 * Kept narrow on purpose — the application layer must not reach for Stripe
 * SDK types.
 */
export interface BillingCheckoutSession {
  url: string;
}

export interface BillingPortalSession {
  url: string;
}

export interface WebhookEvent {
  type: string;
  data: unknown;
}

export interface BillingProviderPort {
  ensureCustomer(input: { userId: string; email: string }): Promise<string>;
  createCheckoutSession(input: {
    customerId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<BillingCheckoutSession>;
  createBillingPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<BillingPortalSession>;
  /** Parse + verify the raw webhook payload + signature header. */
  parseWebhook(rawBody: Buffer, signature: string): WebhookEvent;
}
