import {
  makeBillingProviderMock,
  makeBillingRepoMock,
} from "../../domain/__fixtures__/billing-mocks";
import { BillingProviderPort, WebhookEvent } from "../../domain/ports/billing-provider.port";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { HandleWebhookUseCase } from "./handle-webhook.use-case";

describe("HandleWebhookUseCase", () => {
  let repo: jest.Mocked<BillingRepositoryPort>;
  let provider: jest.Mocked<BillingProviderPort>;
  let useCase: HandleWebhookUseCase;

  const run = (event: WebhookEvent) => {
    provider.parseWebhook.mockReturnValue(event);
    return useCase.execute({ rawBody: Buffer.from("raw"), signature: "sig" });
  };

  beforeEach(() => {
    repo = makeBillingRepoMock();
    provider = makeBillingProviderMock();
    useCase = new HandleWebhookUseCase(repo, provider);
  });

  it("verifies the signature via the provider", async () => {
    await run({ type: "unknown.event", data: {} });
    expect(provider.parseWebhook).toHaveBeenCalledWith(Buffer.from("raw"), "sig");
  });

  it("activates on checkout.session.completed", async () => {
    await run({
      type: "checkout.session.completed",
      data: { customer: "cus_1", subscription: "sub_1" },
    });
    expect(repo.activateSubscription).toHaveBeenCalledWith("cus_1", "sub_1", expect.any(Date));
    expect(repo.cancelSubscription).not.toHaveBeenCalled();
  });

  it("uses the object id as subscription when subscription is absent", async () => {
    await run({
      type: "customer.subscription.created",
      data: { customer: "cus_2", id: "sub_2", status: "active" },
    });
    expect(repo.activateSubscription).toHaveBeenCalledWith("cus_2", "sub_2", expect.any(Date));
  });

  it("cancels when a subscription event carries a terminal status", async () => {
    await run({
      type: "customer.subscription.updated",
      data: { customer: "cus_3", id: "sub_3", status: "canceled" },
    });
    expect(repo.cancelSubscription).toHaveBeenCalledWith("cus_3");
    expect(repo.activateSubscription).not.toHaveBeenCalled();
  });

  it("cancels on customer.subscription.deleted", async () => {
    await run({ type: "customer.subscription.deleted", data: { customer: "cus_4" } });
    expect(repo.cancelSubscription).toHaveBeenCalledWith("cus_4");
  });

  it("no-ops when required ids are missing", async () => {
    await run({ type: "checkout.session.completed", data: { customer: "cus_5" } });
    expect(repo.activateSubscription).not.toHaveBeenCalled();
    expect(repo.cancelSubscription).not.toHaveBeenCalled();
  });

  it("ignores unrelated event types", async () => {
    await run({ type: "invoice.paid", data: { customer: "cus_6" } });
    expect(repo.activateSubscription).not.toHaveBeenCalled();
    expect(repo.cancelSubscription).not.toHaveBeenCalled();
  });
});
