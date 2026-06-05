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
    // PERF-10: PK lookup is direct-seek; count() forces a planner check.
    const row = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      select: { id: true },
    });
    return row !== null;
  }

  async heatmap(episodeId: string, bucketSeconds: number): Promise<ReactionTally> {
    // PERF-07: aggregation pushed to Postgres. The old JS path loaded every
    // single reaction (potentially 10k+ rows for a popular scene) and
    // bucketed them in a Map — drastic when episodes go viral.
    //
    // bucketSeconds is an integer chosen by the caller (no user input
    // ever reaches it), so the integer interpolation is safe here.
    const bucket = Math.max(1, Math.floor(bucketSeconds));
    const rows = await this.prisma.$queryRaw<
      Array<{ from: number; kind: string; count: bigint }>
    >`
      SELECT
        (("secondMark" / ${bucket}) * ${bucket})::int AS from,
        kind,
        count(*)::bigint                              AS count
      FROM "EpisodeReaction"
      WHERE "episodeId" = ${episodeId}
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `;

    const byBucket = new Map<number, { total: number; counts: Record<string, number> }>();
    let total = 0;
    for (const row of rows) {
      const n = Number(row.count);
      total += n;
      let entry = byBucket.get(row.from);
      if (!entry) {
        entry = { total: 0, counts: {} };
        byBucket.set(row.from, entry);
      }
      entry.total += n;
      entry.counts[row.kind] = (entry.counts[row.kind] ?? 0) + n;
    }

    const buckets = [...byBucket.entries()]
      .map(([from, value]) => ({ from, total: value.total, counts: value.counts }))
      .sort((a, b) => a.from - b.from);

    return {
      episodeId,
      bucketSeconds: bucket,
      total,
      buckets,
    };
  }
}
