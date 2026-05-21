import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

/**
 * Disallow auth-gated, ephemeral, and personal routes from search engines.
 * Catalog, genres, studios, anime pages and public profiles stay indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/onboard",
          "/watchlist",
          "/profile",
          "/settings",
          "/security",
          "/notifications",
          "/lifetime-stats",
          "/year-in-review/",
          "/maintenance",
          // Better Auth REST surface — never useful for crawlers.
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
