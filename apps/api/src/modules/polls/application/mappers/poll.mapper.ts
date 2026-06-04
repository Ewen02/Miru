import type { PollDto } from "@miru/types";
import { PollView } from "../../domain/ports/poll-repository.port";

export class PollMapper {
  static toDto(view: { poll: PollView; votedOptionId: string | null }): PollDto {
    const { poll, votedOptionId } = view;
    const closed = poll.closesAt != null && poll.closesAt.getTime() < Date.now();
    return {
      id: poll.id,
      question: poll.question,
      authorName: poll.authorName,
      closesAt: poll.closesAt ? poll.closesAt.toISOString() : null,
      closed,
      totalVotes: poll.totalVotes,
      options: poll.options.map((option) => ({
        id: option.id,
        label: option.label,
        votes: option.votes,
      })),
      votedOptionId,
    };
  }
}
