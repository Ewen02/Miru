import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Resolves messages for the locale segment in the URL (`[locale]`). The
 * middleware guarantees a valid prefix, but we still fall back to the default
 * locale defensively if the segment is missing or unknown.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
