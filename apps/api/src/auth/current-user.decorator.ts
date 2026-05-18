import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { Auth } from "./auth";

/**
 * Extracts the authenticated user id from the Better Auth session.
 *
 * Pair with `@UseGuards(AuthRequiredGuard)` to guarantee a value: this
 * decorator will throw 401 on its own if used on an unprotected route
 * and no session is attached.
 */
export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<{ session?: UserSession<Auth> | null }>();
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new UnauthorizedException("Authentication required");
    }
    return userId;
  },
);
