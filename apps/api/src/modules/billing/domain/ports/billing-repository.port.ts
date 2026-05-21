/**
 * Storage of the Stripe identifiers and active-subscription flag for a user.
 * Only the columns this module owns — the rest of the User row stays in the
 * user module.
 */
export interface UserBillingState {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  proSince: Date | null;
}

export interface BillingRepositoryPort {
  findByUserId(userId: string): Promise<UserBillingState | null>;
  findByCustomerId(customerId: string): Promise<UserBillingState | null>;
  setCustomerId(userId: string, customerId: string): Promise<void>;
  activateSubscription(customerId: string, subscriptionId: string, since: Date): Promise<void>;
  cancelSubscription(customerId: string): Promise<void>;
}
