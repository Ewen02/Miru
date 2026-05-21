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
    const rows = await this.prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
    });
    return rows;
  }
}
