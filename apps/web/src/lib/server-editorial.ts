import "server-only";
import type { ArticleDetailDto, ArticleSummaryDto } from "@miru/types";
import { API_URL } from "./env";

/** Published articles, newest first. */
export async function fetchArticles(limit = 20): Promise<ArticleSummaryDto[]> {
  const url = new URL("/articles", API_URL);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json() as Promise<ArticleSummaryDto[]>;
}

/** A single published article by slug. Null when missing/unpublished. */
export async function fetchArticle(slug: string): Promise<ArticleDetailDto | null> {
  const res = await fetch(new URL(`/articles/${slug}`, API_URL), { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ArticleDetailDto>;
}
