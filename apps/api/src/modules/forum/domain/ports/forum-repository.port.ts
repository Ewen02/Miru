/**
 * Read models built by the repository from the persistence layer; consumed by
 * the use cases and mapped to the Forum DTOs.
 */
export interface ForumThreadSummaryView {
  id: string;
  title: string;
  category: string;
  authorName: string;
  postCount: number;
  updatedAt: Date;
}

export interface ForumPostView {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; image: string | null };
}

export interface ForumThreadDetailView {
  id: string;
  title: string;
  category: string;
  authorName: string;
  createdAt: Date;
  posts: ForumPostView[];
}

export interface ForumRepositoryPort {
  /** Newest-active first (order updatedAt desc); filter by category when provided. */
  listThreads(category: string | null, limit: number): Promise<ForumThreadSummaryView[]>;
  /** A single thread with its posts ordered createdAt asc, or null if it does not exist. */
  getThread(threadId: string): Promise<ForumThreadDetailView | null>;
  /** Create the thread + its first post (the body) in a transaction; returns the new thread id. */
  createThread(input: {
    title: string;
    category: string;
    authorId: string;
    body: string;
  }): Promise<string>;
  /** Append a post to a thread and bump thread.updatedAt. */
  addPost(threadId: string, authorId: string, body: string): Promise<void>;
  threadExists(threadId: string): Promise<boolean>;
}
