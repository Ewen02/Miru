import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { PollRepositoryPort, PollView } from "../../domain/ports/poll-repository.port";

const POLL_INCLUDE = {
  createdBy: { select: { name: true } },
  options: {
    orderBy: { order: "asc" },
    include: { _count: { select: { votes: true } } },
  },
  _count: { select: { votes: true } },
} satisfies Prisma.PollInclude;

type PollRow = Prisma.PollGetPayload<{ include: typeof POLL_INCLUDE }>;

@Injectable()
export class PrismaPollRepository implements PollRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listPolls(
    viewerId: string | null,
    limit: number,
  ): Promise<{ poll: PollView; votedOptionId: string | null }[]> {
    const rows = await this.prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: POLL_INCLUDE,
    });

    const votedByPoll = await this.votedOptionsFor(
      rows.map((row) => row.id),
      viewerId,
    );

    return rows.map((row) => ({
      poll: this.toView(row),
      votedOptionId: votedByPoll.get(row.id) ?? null,
    }));
  }

  async getPoll(
    pollId: string,
    viewerId: string | null,
  ): Promise<{ poll: PollView; votedOptionId: string | null } | null> {
    const row = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: POLL_INCLUDE,
    });
    if (!row) return null;

    const votedByPoll = await this.votedOptionsFor([row.id], viewerId);

    return {
      poll: this.toView(row),
      votedOptionId: votedByPoll.get(row.id) ?? null,
    };
  }

  async vote(pollId: string, optionId: string, userId: string): Promise<void> {
    await this.prisma.pollVote.upsert({
      where: { pollId_userId: { pollId, userId } },
      create: { pollId, optionId, userId },
      update: { optionId },
    });
  }

  /** Map pollId → the viewer's voted optionId, for the given polls. */
  private async votedOptionsFor(
    pollIds: string[],
    viewerId: string | null,
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (!viewerId || pollIds.length === 0) return result;

    const votes = await this.prisma.pollVote.findMany({
      where: { userId: viewerId, pollId: { in: pollIds } },
      select: { pollId: true, optionId: true },
    });
    for (const vote of votes) {
      result.set(vote.pollId, vote.optionId);
    }
    return result;
  }

  private toView(row: PollRow): PollView {
    return {
      id: row.id,
      question: row.question,
      authorName: row.createdBy.name,
      closesAt: row.closesAt,
      totalVotes: row._count.votes,
      options: row.options.map((option) => ({
        id: option.id,
        label: option.label,
        votes: option._count.votes,
      })),
    };
  }
}
