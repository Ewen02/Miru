import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "@miru/db";
import { authMailer } from "./auth-mailer";

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
    // Force email verification before allowing login — keeps bots out and
    // sends the welcome flow only to addresses the user actually owns.
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await authMailer.sendPasswordReset(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await authMailer.sendVerify(user.email, url);
    },
  },
  trustedOrigins: [WEB_ORIGIN],
  // Built-in rate limit for /api/auth/* on top of the global Nest throttler.
  // 30 req/min/IP is loose enough for normal use (a few signup attempts +
  // session refreshes), tight enough to stop credential stuffing scripts.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
  },
  // Map Better Auth's lowercase defaults to our PascalCase Prisma models.
  user: { modelName: "User" },
  session: {
    modelName: "Session",
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
  plugins: [
    twoFactor({
      issuer: "Miru",
    }),
  ],
});

export type Auth = typeof auth;
