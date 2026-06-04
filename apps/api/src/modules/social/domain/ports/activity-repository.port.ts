import type { ActivityKind } from "@miru/types";

/**
 * A single activity event enriched with the actor's name and a preview of its
 * target (anime / list / achievement). A read model built by the repository
 * from the persistence layer; consumed by the feed use case.
 */
export interface ActivityEventView {
  id: string;
  userId: string;
  actorName: string;
  kind: ActivityKind;
  createdAt: Date;
  anime: { slug: string; title: string; coverUrl: string | null } | null;
  list: { id: string; title: string } | null;
  achievement: { code: string; name: string } | null;
  meta: Record<string, unknown> | null;
}

export interface RecordActivityInput {
  userId: string;
  kind: ActivityKind;
  animeId?: string | null;
  listId?: string | null;
  achievementId?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface ActivityRepositoryPort {
  record(input: RecordActivityInput): Promise<void>;
  /** Newest first, joined with actor name + target preview. */
  feedForUsers(userIds: string[], limit: number): Promise<ActivityEventView[]>;
  /** Global feed across all users (trending), newest first. */
  feedGlobal(limit: number): Promise<ActivityEventView[]>;
}
