"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocale } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persists the chosen locale in a cookie and revalidates the current path so
 * RSC pages re-render with the new messages. The form action receives the
 * raw FormData — sub-paths from the switcher just pass `locale`.
 */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (typeof locale !== "string" || !isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  const path = formData.get("next");
  revalidatePath(typeof path === "string" && path ? path : "/");
}
