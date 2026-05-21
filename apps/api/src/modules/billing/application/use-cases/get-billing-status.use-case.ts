import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { BillingRepositoryPort } from "../../domain/ports/billing-repository.port";
import { BILLING_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

export interface BillingStatusOutput {
  isPro: boolean;
  /** ISO string or null. */
  proSince: string | null;
}

@Injectable()
export class GetBillingStatusUseCase implements UseCase<Input, BillingStatusOutput> {
  constructor(
    @Inject(BILLING_REPOSITORY) private readonly repo: BillingRepositoryPort,
  ) {}

  async execute({ userId }: Input): Promise<BillingStatusOutput> {
    const state = await this.repo.findByUserId(userId);
    return {
      isPro: !!state?.proSince,
      proSince: state?.proSince ? state.proSince.toISOString() : null,
    };
  }
}
