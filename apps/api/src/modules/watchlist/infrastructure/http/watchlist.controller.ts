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
import { ImportAniListWatchlistUseCase } from "../../application/use-cases/import-anilist-watchlist.use-case";
import { ListWatchedEpisodesUseCase } from "../../application/use-cases/list-watched-episodes.use-case";
import { MarkEpisodeWatchedUseCase } from "../../application/use-cases/mark-episode-watched.use-case";
import { RemoveFromWatchlistUseCase } from "../../application/use-cases/remove-from-watchlist.use-case";
import { UnmarkEpisodeWatchedUseCase } from "../../application/use-cases/unmark-episode-watched.use-case";
import { UpdateWatchlistEntryUseCase } from "../../application/use-cases/update-watchlist-entry.use-case";
import {
  AddToWatchlistDto,
  UpdateWatchlistEntryDto,
  WatchlistEntryDto,
  WatchlistItemDto,
} from "../../application/dtos/watchlist.dto";

@Controller()
@UseGuards(AuthRequiredGuard)
export class WatchlistController {
  constructor(
    private readonly addToWatchlist: AddToWatchlistUseCase,
    private readonly updateEntry: UpdateWatchlistEntryUseCase,
    private readonly removeEntry: RemoveFromWatchlistUseCase,
    private readonly getWatchlist: GetUserWatchlistUseCase,
    private readonly importAniList: ImportAniListWatchlistUseCase,
    private readonly markEpisode: MarkEpisodeWatchedUseCase,
    private readonly unmarkEpisode: UnmarkEpisodeWatchedUseCase,
    private readonly listWatchedEpisodes: ListWatchedEpisodesUseCase,
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

  /**
   * Import the authenticated user's public AniList list. Idempotent: re-runs
   * upsert existing rows (the user can re-import to refresh progress/scores).
   */
  @Post("watchlist/import/anilist")
  async importFromAniList(
    @CurrentUserId() userId: string,
    @Body() body: { username: string },
  ): Promise<{
    totalFetched: number;
    imported: number;
    skipped: number;
    unknownAnilistIds: number[];
  }> {
    return this.importAniList.execute({ userId, username: body.username ?? "" });
  }

  /** List the episodes the user has marked watched for a given anime. */
  @Get("watchlist/anime/:animeId/episodes")
  async watchedEpisodes(
    @CurrentUserId() userId: string,
    @Param("animeId") animeId: string,
  ): Promise<Array<{ episodeId: string; episodeNumber: number; watchedAt: string }>> {
    const items = await this.listWatchedEpisodes.execute({ userId, animeId });
    return items.map((it) => ({
      episodeId: it.episodeId,
      episodeNumber: it.episodeNumber,
      watchedAt: it.watchedAt.toISOString(),
    }));
  }

  @Post("watchlist/episodes/:episodeId/watched")
  @HttpCode(204)
  async markWatched(
    @CurrentUserId() userId: string,
    @Param("episodeId") episodeId: string,
  ): Promise<void> {
    await this.markEpisode.execute({ userId, episodeId });
  }

  @Delete("watchlist/episodes/:episodeId/watched")
  @HttpCode(204)
  async unmarkWatched(
    @CurrentUserId() userId: string,
    @Param("episodeId") episodeId: string,
  ): Promise<void> {
    await this.unmarkEpisode.execute({ userId, episodeId });
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
