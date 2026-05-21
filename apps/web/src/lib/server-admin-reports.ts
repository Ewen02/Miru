import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "./env";
import type { AdminReportItem } from "@miru/types";

/**
 * Server-side fetch of the admin moderation queue. Returns null when the
 * current user isn't an admin (the page redirects on null).
 */
export async function fetchAdminReports(): Promise<AdminReportItem[] | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const res = await fetch(new URL("/admin/reports", API_URL), {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<AdminReportItem[]>;
}
