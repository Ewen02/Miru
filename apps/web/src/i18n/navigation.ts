import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these `Link`, `redirect`,
 * `useRouter`, `usePathname`, `getPathname` in place of the next/* ones so
 * the active locale prefix is preserved automatically across navigations.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
