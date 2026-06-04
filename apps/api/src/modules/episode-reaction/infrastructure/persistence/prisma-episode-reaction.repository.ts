import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  EpisodeReactionRepositoryPort,
  ReactionTally,
} from "../../domain/ports/episode-reaction-repository.port";

@Injectable()
export class PrismaEpisodeReactionRepository implements EpisodeReactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async addReaction(
    episodeId: string,
    userId: string,
    secondMark: number,
    kind: string,
  ): Promise<void> {
    await this.prisma.episodeReaction.create({
      data: { episodeId, userId, secondMark, kind },
    });
  }

  async episodeExists(episodeId: string): Promise<boolean> {
    const count = await this.prisma.episode.count({ where: { id: episodeId } });
    return count > 0;
  }

  async heatmap(episodeId: string, bucketSeconds: number): Promise<ReactionTally> {
    const rows = await this.prisma.episodeReaction.findMany({
      where: { episodeId },
      select: { secondMark: true, kind: true },
    });

    const byBucket = new Map<number, { total: number; counts: Record<string, number> }>();
    for (const row of rows) {
      const from = Math.floor(row.secondMark / bucketSeconds) * bucketSeconds;
      let bucket = byBucket.get(from);
      if (!bucket) {
        bucket = { total: 0, counts: {} };
        byBucket.set(from, bucket);
      }
      bucket.total += 1;
      bucket.counts[row.kind] = (bucket.counts[row.kind] ?? 0) + 1;
    }

    const buckets = [...byBucket.entries()]
      .map(([from, value]) => ({ from, total: value.total, counts: value.counts }))
      .sort((a, b) => a.from - b.from);

    return {
      episodeId,
      bucketSeconds,
      total: rows.length,
      buckets,
    };
  }
}
