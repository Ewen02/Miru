import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { Auth } from "./auth";

/**
 * Reads the current Session row id (not the user id) from the request session.
 * Pair with AuthRequiredGuard or OptionalAuthGuard so the session is attached.
 * Returns null when no session, but callers usually pair with a guard that
 * makes the user-facing pieces fail closed.
 */
export const CurrentSessionId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest<{ session?: UserSession<Auth> | null }>();
    // Better Auth surfaces the session row as `session.session.id`.
    const inner = (req.session as { session?: { id?: string } } | null | undefined)?.session;
    return inner?.id ?? null;
  },
);
