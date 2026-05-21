import {
  EpisodeLinkSource,
  EpisodePlatformLinkEntity,
} from "../entities/episode-platform-link.entity";

export interface UpsertEpisodeLinkInput {
  episodeId: string;
  source: EpisodeLinkSource;
  url: string;
}

export interface EpisodeLinkRepositoryPort {
  /** Upsert by (episodeId, source). Refreshes `verifiedAt`. Returns the row. */
  upsert(input: UpsertEpisodeLinkInput): Promise<EpisodePlatformLinkEntity>;
  /** List non-broken links for an episode. */
  findByEpisodeId(episodeId: string): Promise<EpisodePlatformLinkEntity[]>;
  /** List links last verified before `olderThan` — drives the verify cron. */
  findStale(olderThan: Date, limit: number): Promise<EpisodePlatformLinkEntity[]>;
  /** Mark a link as broken (404) right now. */
  markBroken(id: string): Promise<void>;
  /** Refresh `verifiedAt` to now (probe passed). */
  markVerified(id: string): Promise<void>;
}
