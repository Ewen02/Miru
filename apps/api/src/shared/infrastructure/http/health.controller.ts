import { Controller, Get, HttpCode, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";

/**
 * Two endpoints designed for orchestrators (Railway, Kubernetes):
 *
 * - GET /health  → liveness: cheap, no I/O. If this fails, restart the pod.
 * - GET /health/ready → readiness: pings the DB. Returns 503 when the DB
 *   is unreachable so the load balancer takes the instance out of rotation
 *   without restarting it.
 */
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  liveness(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  async readiness(): Promise<{ status: "ok"; db: "ok" }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "ok" };
    } catch (err) {
      throw new ServiceUnavailableException({
        status: "degraded",
        db: "down",
        message: (err as Error).message,
      });
    }
  }
}
