import {
  makeBillingProviderMock,
  makeBillingRepoMock,
} from "../../domain/__fixtures__/billing-mocks";
import { BillingProviderPort } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { StartCheckoutUseCase } from "./start-checkout.use-case";

describe("StartCheckoutUseCase", () => {
  let repo: jest.Mocked<BillingRepositoryPort>;
  let provider: jest.Mocked<BillingProviderPort>;
  let useCase: StartCheckoutUseCase;

  const input = {
    userId: "u1",
    email: "u1@example.com",
    successUrl: "https://miru.app/ok",
    cancelUrl: "https://miru.app/cancel",
  };

  beforeEach(() => {
    repo = makeBillingRepoMock();
    provider = makeBillingProviderMock();
    useCase = new StartCheckoutUseCase(repo, provider);
    provider.createCheckoutSession.mockResolvedValue({ url: "https://stripe/checkout" });
  });

  it("creates and persists a customer on first checkout", async () => {
    repo.findByUserId.mockResolvedValue(null);
    provider.ensureCustomer.mockResolvedValue("cus_new");

    const result = await useCase.execute(input);

    expect(provider.ensureCustomer).toHaveBeenCalledWith({
      userId: "u1",
      email: "u1@example.com",
    });
    expect(repo.setCustomerId).toHaveBeenCalledWith("u1", "cus_new");
    expect(provider.createCheckoutSession).toHaveBeenCalledWith({
      customerId: "cus_new",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
    expect(result).toEqual({ url: "https://stripe/checkout" });
  });

  it("reuses the existing customer and does not re-create it", async () => {
    repo.findByUserId.mockResolvedValue({
      userId: "u1",
      stripeCustomerId: "cus_existing",
      stripeSubId: null,
      proSince: null,
    });

    await useCase.execute(input);

    expect(provider.ensureCustomer).not.toHaveBeenCalled();
    expect(repo.setCustomerId).not.toHaveBeenCalled();
    expect(provider.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cus_existing" }),
    );
  });
});
