import { BillingProviderPort } from "../ports/billing-provider.port";
import { BillingRepositoryPort } from "../ports/billing-repository.port";

export function makeBillingRepoMock(): jest.Mocked<BillingRepositoryPort> {
  return {
    findByUserId: jest.fn(),
    findByCustomerId: jest.fn(),
    setCustomerId: jest.fn(),
    activateSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
  };
}

export function makeBillingProviderMock(): jest.Mocked<BillingProviderPort> {
  return {
    ensureCustomer: jest.fn(),
    createCheckoutSession: jest.fn(),
    createBillingPortalSession: jest.fn(),
    parseWebhook: jest.fn(),
  };
}
