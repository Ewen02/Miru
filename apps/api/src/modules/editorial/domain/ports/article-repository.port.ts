/**
 * Read models built by the repository from the persistence layer; consumed by
 * the use cases and mapped to the Article DTOs.
 */
export interface ArticleSummaryView {
  slug: string;
  title: string;
  kicker: string | null;
  excerpt: string | null;
  coverUrl: string | null;
  authorName: string;
  publishedAt: Date | null;
}

export interface ArticleDetailView extends ArticleSummaryView {
  body: string;
}

export interface ArticleRepositoryPort {
  /** Published articles only (where published=true), ordered publishedAt desc. */
  listPublished(limit: number): Promise<ArticleSummaryView[]>;
  /** A single published article by slug, or null if it does not exist or is unpublished. */
  getPublishedBySlug(slug: string): Promise<ArticleDetailView | null>;
  /**
   * Create the article and return its slug. Sets published + publishedAt(now)
   * when publish=true; otherwise published=false and publishedAt=null.
   */
  create(input: {
    slug: string;
    title: string;
    kicker: string | null;
    excerpt: string | null;
    body: string;
    coverUrl: string | null;
    authorId: string;
    publish: boolean;
  }): Promise<string>;
  /** Whether an article already uses this slug. */
  slugExists(slug: string): Promise<boolean>;
}
