import { API_URL } from "./env";
import "server-only";
import { cookies } from "next/headers";
import type { YearInReviewDto } from "@miru/types";


export async function fetchUserYearInReview(year: number): Promise<YearInReviewDto | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const url = new URL(`/users/me/year-in-review/${year}`, API_URL);
  const res = await fetch(url, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<YearInReviewDto>;
}
