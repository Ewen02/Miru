import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Sentry instrumentation MUST be imported before any other module
 * (especially Nest) so the OpenTelemetry auto-instrumentations patch
 * http/express/prisma before they are required.
 *
 * Setting SENTRY_DSN to an empty string in dev is enough to disable
 * Sentry without commenting code out.
 */
const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.SENTRY_RELEASE,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.1),
  });
}
