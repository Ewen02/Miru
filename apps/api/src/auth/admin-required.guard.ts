import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import type { Auth } from "./auth";

/**
 * Role check. ALWAYS pair with AuthRequiredGuard first:
 * `@UseGuards(AuthRequiredGuard, AdminRequiredGuard)` — it relies on
 * `req.session` already being populated.
 */
@Injectable()
export class AdminRequiredGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<
      Request & { session?: UserSession<Auth> | null }
    >();
    const userId = req.session?.user?.id;
    if (!userId) throw new ForbiddenException("Authentication required");
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") {
      throw new ForbiddenException("Admin role required");
    }
    return true;
  }
}
