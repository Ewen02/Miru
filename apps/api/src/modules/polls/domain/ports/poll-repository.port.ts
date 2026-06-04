/**
 * A poll enriched with its author's name and per-option vote tallies. A read
 * model built by the repository from the persistence layer; consumed by the
 * use cases and mapped to PollDto.
 */
export interface PollView {
  id: string;
  question: string;
  authorName: string;
  closesAt: Date | null;
  totalVotes: number;
  options: { id: string; label: string; votes: number }[];
}

/** A poll view paired with the viewer's own vote (or null). */
export interface PollWithViewerVote {
  poll: PollView;
  votedOptionId: string | null;
}

export interface PollRepositoryPort {
  /** Newest first, enriched with the viewer's own vote (or null). */
  listPolls(viewerId: string | null, limit: number): Promise<PollWithViewerVote[]>;
  /** A single poll enriched with the viewer's vote, or null if it does not exist. */
  getPoll(pollId: string, viewerId: string | null): Promise<PollWithViewerVote | null>;
  /** Upsert the user's single vote on a poll — changing vote updates it. */
  vote(pollId: string, optionId: string, userId: string): Promise<void>;
}
