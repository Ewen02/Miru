import type { MetadataRoute } from "next";
import { fetchAnimeCatalog } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await fetchAnimeCatalog({ pageSize: 100 }).catch(() => null);
  const animeEntries: MetadataRoute.Sitemap =
    catalog?.data.map((a) => ({
      url: `${SITE_URL}/anime/${a.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) ?? [];

  return [{ url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 }, ...animeEntries];
}
