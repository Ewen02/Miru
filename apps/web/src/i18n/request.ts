import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./config";

/**
 * Locale resolution priority:
 *  1. miru.locale cookie set by the switcher
 *  2. Accept-Language header
 *  3. fr (default)
 *
 * Routing-based locales (/fr/, /en/) would mean restructuring every route
 * under [locale]/. Cookie-based keeps URLs stable; trade-off is no per-locale
 * canonical URLs for SEO.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerList = await headers();

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  let locale = isLocale(cookieLocale) ? cookieLocale : null;

  if (!locale) {
    const accept = headerList.get("accept-language") ?? "";
    if (accept.toLowerCase().startsWith("en")) locale = "en";
  }

  locale = locale ?? DEFAULT_LOCALE;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
