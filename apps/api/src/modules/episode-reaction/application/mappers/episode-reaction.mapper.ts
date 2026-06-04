import type { EpisodeHeatmapBucketDto, EpisodeHeatmapDto } from "@miru/types";
import { ReactionTally } from "../../domain/ports/episode-reaction-repository.port";

export class EpisodeReactionMapper {
  static toHeatmapDto(tally: ReactionTally): EpisodeHeatmapDto {
    return {
      episodeId: tally.episodeId,
      bucketSeconds: tally.bucketSeconds,
      total: tally.total,
      buckets: tally.buckets.map(
        (bucket): EpisodeHeatmapBucketDto => ({
          from: bucket.from,
          total: bucket.total,
          counts: bucket.counts as EpisodeHeatmapBucketDto["counts"],
        }),
      ),
    };
  }
}
