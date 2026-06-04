import { Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { ActivityEventDto, FollowStatsDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { OptionalAuthGuard } from "@auth/optional-auth.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { OptionalUserId } from "@auth/optional-user.decorator";
import { FollowUserUseCase } from "../../application/use-cases/follow-user.use-case";
import { UnfollowUserUseCase } from "../../application/use-cases/unfollow-user.use-case";
import { GetFollowStatsUseCase } from "../../application/use-cases/get-follow-stats.use-case";
import { GetActivityFeedUseCase } from "../../application/use-cases/get-activity-feed.use-case";
import { ActivityMapper } from "../../application/mappers/activity.mapper";
import { FeedQueryDto } from "../../application/dtos/social.dto";

@Controller("social")
export class SocialController {
  constructor(
    private readonly followUser: FollowUserUseCase,
    private readonly unfollowUser: UnfollowUserUseCase,
    private readonly getFollowStats: GetFollowStatsUseCase,
    private readonly getActivityFeed: GetActivityFeedUseCase,
  ) {}

  @Post("follow/:userId")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async follow(
    @Param("userId") targetId: string,
    @CurrentUserId() followerId: string,
  ): Promise<void> {
    await this.followUser.execute({ followerId, targetId });
  }

  @Delete("follow/:userId")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async unfollow(
    @Param("userId") targetId: string,
    @CurrentUserId() followerId: string,
  ): Promise<void> {
    await this.unfollowUser.execute({ followerId, targetId });
  }

  @Get("follow-stats/:userId")
  @UseGuards(OptionalAuthGuard)
  async followStats(
    @Param("userId") userId: string,
    @OptionalUserId() viewerId: string | null,
  ): Promise<FollowStatsDto> {
    return this.getFollowStats.execute({ userId, viewerId });
  }

  @Get("feed")
  @UseGuards(AuthRequiredGuard)
  async feed(
    @CurrentUserId() userId: string,
    @Query() query: FeedQueryDto,
  ): Promise<ActivityEventDto[]> {
    const events = await this.getActivityFeed.execute({ userId, limit: query.limit });
    return events.map((event) => ActivityMapper.toDto(event));
  }
}
