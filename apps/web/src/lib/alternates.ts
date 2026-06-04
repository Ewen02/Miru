import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/i18n/config";

/**
 * Builds self-referencing canonical + hreflang alternates for a route.
 *
 * `path` is the locale-agnostic pathname (e.g. "/anime/naruto"). The default
 * locale (fr) is served at the bare path; other locales are prefixed
 * ("/en/anime/naruto"). Pass the current `locale` so the canonical points at
 * the right variant.
 */
export function buildAlternates(path: string, locale: string): Metadata["alternates"] {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const fr = clean;
  const en = clean === "/" ? "/en" : `/en${clean}`;
  return {
    canonical: locale === DEFAULT_LOCALE ? fr : en,
    languages: { fr, en },
  };
}
