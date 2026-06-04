import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { PollDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { OptionalAuthGuard } from "@auth/optional-auth.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { OptionalUserId } from "@auth/optional-user.decorator";
import { ListPollsUseCase } from "../../application/use-cases/list-polls.use-case";
import { VoteOnPollUseCase } from "../../application/use-cases/vote-on-poll.use-case";
import { PollMapper } from "../../application/mappers/poll.mapper";
import { PollsQueryDto, VoteDto } from "../../application/dtos/poll.dto";

@Controller("polls")
export class PollsController {
  constructor(
    private readonly listPolls: ListPollsUseCase,
    private readonly voteOnPoll: VoteOnPollUseCase,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async list(
    @OptionalUserId() viewerId: string | null,
    @Query() query: PollsQueryDto,
  ): Promise<PollDto[]> {
    const polls = await this.listPolls.execute({ viewerId, limit: query.limit });
    return polls.map((poll) => PollMapper.toDto(poll));
  }

  @Post(":id/vote")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(200)
  async vote(
    @Param("id") pollId: string,
    @CurrentUserId() userId: string,
    @Body() body: VoteDto,
  ): Promise<PollDto> {
    const updated = await this.voteOnPoll.execute({ pollId, optionId: body.optionId, userId });
    return PollMapper.toDto(updated);
  }
}
