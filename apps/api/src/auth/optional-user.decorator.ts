import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { Auth } from "./auth";

/**
 * Reads the authenticated user id from the request session, returning null
 * when no session is attached. Pair with `OptionalAuthGuard` so the session
 * is resolved before this decorator runs.
 */
export const OptionalUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest<{ session?: UserSession<Auth> | null }>();
    return req.session?.user?.id ?? null;
  },
);
