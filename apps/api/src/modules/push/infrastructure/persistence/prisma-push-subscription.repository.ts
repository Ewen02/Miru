import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  PushSubscriptionRecord,
  PushSubscriptionRepositoryPort,
} from "../../domain/ports/push-subscription.port";

@Injectable()
export class PrismaPushSubscriptionRepository implements PushSubscriptionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    sub: PushSubscriptionRecord,
    userAgent: string | null,
  ): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent,
      },
      update: {
        userId,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent,
      },
    });
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async findByUserId(userId: string): Promise<PushSubscriptionRecord[]> {
    // PERF-05: hard cap. A single user accumulating 50+ subscriptions
    // (multi-device, browser-profile churn) would fan-out N push sends
    // per notification. 20 active devices is already excessive — past
    // that we drop the oldest ones at the next subscribe.
    const rows = await this.prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return rows;
  }
}
