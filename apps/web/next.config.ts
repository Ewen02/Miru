import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.anili.st" },
      { protocol: "https", hostname: "**.crunchyroll.com" },
      { protocol: "https", hostname: "**.netflix.com" },
      { protocol: "https", hostname: "**.hidive.com" },
      { protocol: "https", hostname: "**.funimation.com" },
    ],
  },
};

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

// Only wrap with Sentry when both org and project are configured — locally
// this avoids pulling sentry-cli at every dev/build invocation.
const wrapped = withNextIntl(nextConfig);

export default sentryOrg && sentryProject
  ? withSentryConfig(wrapped, {
      org: sentryOrg,
      project: sentryProject,
      silent: !process.env.CI,
      // Upload source maps only when an auth token is provided (i.e. CI/prod).
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    })
  : wrapped;
