import { NotFoundException } from "@shared/domain/domain-exception";
import {
  makeBillingProviderMock,
  makeBillingRepoMock,
} from "../../domain/__fixtures__/billing-mocks";
import { BillingProviderPort } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { OpenPortalUseCase } from "./open-portal.use-case";

describe("OpenPortalUseCase", () => {
  let repo: jest.Mocked<BillingRepositoryPort>;
  let provider: jest.Mocked<BillingProviderPort>;
  let useCase: OpenPortalUseCase;

  beforeEach(() => {
    repo = makeBillingRepoMock();
    provider = makeBillingProviderMock();
    useCase = new OpenPortalUseCase(repo, provider);
  });

  it("throws NotFound when the user has no Stripe customer", async () => {
    repo.findByUserId.mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: "u1", returnUrl: "https://miru.app/settings" }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(provider.createBillingPortalSession).not.toHaveBeenCalled();
  });

  it("opens a portal session for an existing customer", async () => {
    repo.findByUserId.mockResolvedValue({
      userId: "u1",
      stripeCustomerId: "cus_1",
      stripeSubId: "sub_1",
      proSince: new Date(),
    });
    provider.createBillingPortalSession.mockResolvedValue({ url: "https://stripe/portal" });

    const result = await useCase.execute({
      userId: "u1",
      returnUrl: "https://miru.app/settings",
    });

    expect(provider.createBillingPortalSession).toHaveBeenCalledWith({
      customerId: "cus_1",
      returnUrl: "https://miru.app/settings",
    });
    expect(result).toEqual({ url: "https://stripe/portal" });
  });
});
