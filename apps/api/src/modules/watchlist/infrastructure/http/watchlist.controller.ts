import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { WatchStatus } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { AddToWatchlistUseCase } from "../../application/use-cases/add-to-watchlist.use-case";
import { GetUserWatchlistUseCase } from "../../application/use-cases/get-user-watchlist.use-case";
import { RemoveFromWatchlistUseCase } from "../../application/use-cases/remove-from-watchlist.use-case";
import { UpdateWatchlistEntryUseCase } from "../../application/use-cases/update-watchlist-entry.use-case";
import {
  AddToWatchlistDto,
  UpdateWatchlistEntryDto,
  WatchlistEntryDto,
  WatchlistItemDto,
} from "./watchlist.dto";

@Controller()
@UseGuards(AuthRequiredGuard)
export class WatchlistController {
  constructor(
    private readonly addToWatchlist: AddToWatchlistUseCase,
    private readonly updateEntry: UpdateWatchlistEntryUseCase,
    private readonly removeEntry: RemoveFromWatchlistUseCase,
    private readonly getWatchlist: GetUserWatchlistUseCase,
  ) {}

  @Post("watchlist")
  async add(
    @CurrentUserId() userId: string,
    @Body() body: AddToWatchlistDto,
  ): Promise<WatchlistEntryDto> {
    const entry = await this.addToWatchlist.execute({
      userId,
      animeId: body.animeId,
      status: body.status,
    });
    return toEntryDto(entry);
  }

  @Patch("watchlist/:animeId")
  async update(
    @CurrentUserId() userId: string,
    @Param("animeId") animeId: string,
    @Body() body: UpdateWatchlistEntryDto,
  ): Promise<WatchlistEntryDto> {
    const entry = await this.updateEntry.execute({ userId, animeId, ...body });
    return toEntryDto(entry);
  }

  @Delete("watchlist/:animeId")
  @HttpCode(204)
  async remove(
    @CurrentUserId() userId: string,
    @Param("animeId") animeId: string,
  ): Promise<void> {
    await this.removeEntry.execute({ userId, animeId });
  }

  @Get("users/me/watchlist")
  async list(
    @CurrentUserId() userId: string,
    @Query("status") status?: string,
  ): Promise<WatchlistItemDto[]> {
    const items = await this.getWatchlist.execute({
      userId,
      status: isWatchStatus(status) ? status : undefined,
    });
    return items.map((item) => ({
      ...toEntryDto(item.entry),
      anime: item.anime,
    }));
  }
}

function toEntryDto(entry: {
  userId: string;
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}): WatchlistEntryDto {
  return {
    userId: entry.userId,
    animeId: entry.animeId,
    status: entry.status,
    currentEpisode: entry.currentEpisode,
    rating: entry.rating,
    isFavorite: entry.isFavorite,
    startedAt: entry.startedAt?.toISOString() ?? null,
    completedAt: entry.completedAt?.toISOString() ?? null,
  };
}

function isWatchStatus(value: string | undefined): value is WatchStatus {
  return value !== undefined && Object.values(WatchStatus).includes(value as WatchStatus);
}
