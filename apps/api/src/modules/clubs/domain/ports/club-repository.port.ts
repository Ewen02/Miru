/**
 * Read models built by the repository from the persistence layer; consumed by
 * the use cases and mapped to the Club DTOs.
 */
export interface ClubSummaryView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  /** Whether the current viewer is a member. */
  isMember: boolean;
}

export interface ClubPostView {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; image: string | null };
}

export interface ClubDetailView extends ClubSummaryView {
  ownerName: string;
  posts: ClubPostView[];
}

export interface ClubRepositoryPort {
  /** Newest first (order createdAt desc); isMember computed from the viewer. */
  listClubs(viewerId: string | null, limit: number): Promise<ClubSummaryView[]>;
  /** A single club with its posts ordered createdAt desc, or null if it does not exist. */
  getClub(slug: string, viewerId: string | null): Promise<ClubDetailView | null>;
  /** Create the club and auto-add the owner as a member in a transaction; returns the slug. */
  createClub(input: {
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
  }): Promise<string>;
  /** Idempotent upsert on the unique (clubId, userId) membership. */
  join(clubId: string, userId: string): Promise<void>;
  leave(clubId: string, userId: string): Promise<void>;
  addPost(clubId: string, authorId: string, body: string): Promise<void>;
  findIdBySlug(slug: string): Promise<string | null>;
}
