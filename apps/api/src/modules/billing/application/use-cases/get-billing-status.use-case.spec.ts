import { makeBillingRepoMock } from "../../domain/__fixtures__/billing-mocks";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { GetBillingStatusUseCase } from "./get-billing-status.use-case";

describe("GetBillingStatusUseCase", () => {
  let repo: jest.Mocked<BillingRepositoryPort>;
  let useCase: GetBillingStatusUseCase;

  beforeEach(() => {
    repo = makeBillingRepoMock();
    useCase = new GetBillingStatusUseCase(repo);
  });

  it("reports not-pro when there is no billing state", async () => {
    repo.findByUserId.mockResolvedValue(null);
    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      isPro: false,
      proSince: null,
    });
  });

  it("reports not-pro when proSince is null", async () => {
    repo.findByUserId.mockResolvedValue({
      userId: "u1",
      stripeCustomerId: "cus_1",
      stripeSubId: null,
      proSince: null,
    });
    const result = await useCase.execute({ userId: "u1" });
    expect(result.isPro).toBe(false);
    expect(result.proSince).toBeNull();
  });

  it("reports pro with an ISO proSince when active", async () => {
    const since = new Date("2026-01-15T10:00:00.000Z");
    repo.findByUserId.mockResolvedValue({
      userId: "u1",
      stripeCustomerId: "cus_1",
      stripeSubId: "sub_1",
      proSince: since,
    });
    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      isPro: true,
      proSince: since.toISOString(),
    });
  });
});
