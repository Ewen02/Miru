import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { auth, type Auth } from "./auth";

/**
 * Use this guard on any route that requires an authenticated user. The
 * global Better Auth guard is disabled, so each protected controller opts in
 * explicitly with `@UseGuards(AuthRequiredGuard)`.
 *
 * The guard reads the session from Better Auth using the request headers and
 * caches it on `req.session` so downstream decorators (e.g. CurrentUserId)
 * can read it without re-querying.
 */
@Injectable()
export class AuthRequiredGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<
      Request & { session?: UserSession<Auth> | null }
    >();

    if (!req.session) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      req.session = session as UserSession<Auth> | null;
    }

    if (!req.session?.user?.id) {
      throw new UnauthorizedException("Authentication required");
    }
    return true;
  }
}
