import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  BillingRepositoryPort,
  UserBillingState,
} from "../../domain/ports/billing-repository.port";

@Injectable()
export class PrismaBillingRepository implements BillingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserBillingState | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, stripeCustomerId: true, stripeSubId: true, proSince: true },
    });
    if (!user) return null;
    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubId: user.stripeSubId,
      proSince: user.proSince,
    };
  }

  async findByCustomerId(customerId: string): Promise<UserBillingState | null> {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, stripeCustomerId: true, stripeSubId: true, proSince: true },
    });
    if (!user) return null;
    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubId: user.stripeSubId,
      proSince: user.proSince,
    };
  }

  async setCustomerId(userId: string, customerId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  async activateSubscription(
    customerId: string,
    subscriptionId: string,
    since: Date,
  ): Promise<void> {
    // updateMany so we don't throw when the customer row doesn't exist
    // (rare race with deleted users — webhook arrives after deletion).
    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { stripeSubId: subscriptionId, proSince: since },
    });
  }

  async cancelSubscription(customerId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { stripeSubId: null, proSince: null },
    });
  }
}
