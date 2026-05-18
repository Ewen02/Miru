import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@miru/db";

const SECRET = process.env.BETTER_AUTH_SECRET;
if (!SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required");
}

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

/**
 * Singleton BetterAuth instance shared by the NestJS controller mount and any
 * consumer that needs to inspect a session outside the request lifecycle.
 *
 * IMPORTANT: this module is loaded before the NestJS DI graph, so it uses the
 * Prisma singleton exposed by @miru/db rather than PrismaService.
 */
export const auth = betterAuth({
  baseURL: API_BASE_URL,
  basePath: "/api/auth",
  secret: SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  trustedOrigins: [WEB_ORIGIN],
  // Map Better Auth's lowercase defaults to our PascalCase Prisma models.
  user: { modelName: "User" },
  session: {
    modelName: "Session",
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
});

export type Auth = typeof auth;
