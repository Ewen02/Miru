import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./config";

/**
 * Path-prefixed locale routing. With `localePrefix: "as-needed"`, the default
 * locale (fr) keeps clean URLs (`/anime/x`) while `en` is prefixed (`/en/anime/x`).
 * This exposes the EN content to crawlers and lets us emit hreflang alternates —
 * which the previous cookie-based setup could not.
 *
 * `localeDetection` lets the middleware redirect a first-time visitor to their
 * Accept-Language locale; the choice is then remembered via the NEXT_LOCALE cookie.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: true,
});
