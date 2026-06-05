import "server-only";
import { cache } from "react";
import type { ArticleDetailDto, ArticleSummaryDto } from "@miru/types";
import { API_URL } from "./env";

/** Published articles, newest first. */
export const fetchArticles = cache(async (limit = 20): Promise<ArticleSummaryDto[]> => {
  const url = new URL("/articles", API_URL);
  url.searchParams.set("limit", String(limit));
  // Next 16: `cache: "force-cache"` is mandatory for persistent caching;
  // `next.revalidate` alone no longer opts in.
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 300, tags: ["editorial"] },
  });
  if (!res.ok) return [];
  return res.json() as Promise<ArticleSummaryDto[]>;
});

/** A single published article by slug. Null when missing/unpublished. */
export const fetchArticle = cache(async (slug: string): Promise<ArticleDetailDto | null> => {
  const res = await fetch(new URL(`/articles/${slug}`, API_URL), {
    cache: "force-cache",
    next: { revalidate: 300, tags: ["editorial", `editorial:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ArticleDetailDto>;
});
