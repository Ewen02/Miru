/**
 * Aggregated reactions for an episode, bucketed into fixed time windows. A read
 * model built by the repository from the persistence layer; consumed by the use
 * cases and mapped to EpisodeHeatmapDto.
 */
export interface ReactionTally {
  episodeId: string;
  bucketSeconds: number;
  total: number;
  buckets: { from: number; total: number; counts: Record<string, number> }[];
}

export interface EpisodeReactionRepositoryPort {
  /** Persist a single timestamped reaction. */
  addReaction(episodeId: string, userId: string, secondMark: number, kind: string): Promise<void>;
  /**
   * Aggregate every reaction for the episode into time buckets of `bucketSeconds`
   * width. Each bucket carries its total plus counts broken down by kind.
   */
  heatmap(episodeId: string, bucketSeconds: number): Promise<ReactionTally>;
  /** Whether an episode with this id exists. */
  episodeExists(episodeId: string): Promise<boolean>;
}
