import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import type { ClubDetailDto, ClubSummaryDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { OptionalAuthGuard } from "@auth/optional-auth.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { OptionalUserId } from "@auth/optional-user.decorator";
import { ListClubsUseCase } from "../../application/use-cases/list-clubs.use-case";
import { GetClubUseCase } from "../../application/use-cases/get-club.use-case";
import { CreateClubUseCase } from "../../application/use-cases/create-club.use-case";
import { JoinClubUseCase } from "../../application/use-cases/join-club.use-case";
import { LeaveClubUseCase } from "../../application/use-cases/leave-club.use-case";
import { PostToClubUseCase } from "../../application/use-cases/post-to-club.use-case";
import { ClubMapper } from "../../application/mappers/club.mapper";
import { ClubPostBodyDto, ClubsQueryDto, CreateClubDto } from "../../application/dtos/club.dto";

@Controller("clubs")
export class ClubsController {
  constructor(
    private readonly listClubs: ListClubsUseCase,
    private readonly getClub: GetClubUseCase,
    private readonly createClub: CreateClubUseCase,
    private readonly joinClub: JoinClubUseCase,
    private readonly leaveClub: LeaveClubUseCase,
    private readonly postToClub: PostToClubUseCase,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async list(
    @OptionalUserId() viewerId: string | null,
    @Query() query: ClubsQueryDto,
  ): Promise<ClubSummaryDto[]> {
    const clubs = await this.listClubs.execute({ viewerId, limit: query.limit });
    return clubs.map((club) => ClubMapper.toSummaryDto(club));
  }

  @Get(":slug")
  @UseGuards(OptionalAuthGuard)
  async detail(
    @Param("slug") slug: string,
    @OptionalUserId() viewerId: string | null,
  ): Promise<ClubDetailDto> {
    const club = await this.getClub.execute({ slug, viewerId });
    return ClubMapper.toDetailDto(club);
  }

  @Post()
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async create(
    @CurrentUserId() ownerId: string,
    @Body() body: CreateClubDto,
  ): Promise<ClubDetailDto> {
    const club = await this.createClub.execute({
      ownerId,
      name: body.name,
      description: body.description,
    });
    return ClubMapper.toDetailDto(club);
  }

  @Post(":slug/join")
  @UseGuards(AuthRequiredGuard)
  async join(@Param("slug") slug: string, @CurrentUserId() userId: string): Promise<ClubDetailDto> {
    const club = await this.joinClub.execute({ slug, userId });
    return ClubMapper.toDetailDto(club);
  }

  @Post(":slug/leave")
  @UseGuards(AuthRequiredGuard)
  async leave(
    @Param("slug") slug: string,
    @CurrentUserId() userId: string,
  ): Promise<ClubDetailDto> {
    const club = await this.leaveClub.execute({ slug, userId });
    return ClubMapper.toDetailDto(club);
  }

  @Post(":slug/posts")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async post(
    @Param("slug") slug: string,
    @CurrentUserId() userId: string,
    @Body() body: ClubPostBodyDto,
  ): Promise<ClubDetailDto> {
    const club = await this.postToClub.execute({ slug, userId, body: body.body });
    return ClubMapper.toDetailDto(club);
  }
}
