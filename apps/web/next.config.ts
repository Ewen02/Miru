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
    // Tight breakpoint list — defaults bake 8 sizes per image which is
    // overkill for our card grid + hero. Aligned with the design system
    // breakpoints (mobile / tablet / desktop / wide).
    deviceSizes: [640, 768, 1024, 1280, 1920],
    // Used by Image.sizes for fixed-width covers (180px hero, ~240px card).
    imageSizes: [96, 180, 240, 360],
    // Prefer AVIF then WebP. Both are ~30% smaller than JPEG; AVIF needs a
    // bit more CPU to encode so the order matters (Next picks the first
    // format the client accepts).
    formats: ["image/avif", "image/webp"],
    // Cache the optimised image for 24h instead of the 60s default —
    // covers don't change once an anime is imported.
    minimumCacheTTL: 86400,
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
