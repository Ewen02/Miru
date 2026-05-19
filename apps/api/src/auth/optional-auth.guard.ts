import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { auth, type Auth } from "./auth";

/**
 * Resolves the session if present and attaches it to the request, but never
 * blocks an anonymous visitor. Use on routes that personalize for logged-in
 * users yet still need to serve a sensible response when there's no session.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
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
    return true;
  }
}
