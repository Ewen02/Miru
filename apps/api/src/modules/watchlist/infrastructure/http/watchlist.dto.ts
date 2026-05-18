import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { WatchStatus } from "@miru/types";

const STATUS_VALUES = Object.values(WatchStatus);

export class AddToWatchlistDto {
  @IsString()
  animeId!: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: WatchStatus;
}

export class UpdateWatchlistEntryDto {
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: WatchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentEpisode?: number;

  // null is allowed to clear an existing rating.
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number | null;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export interface WatchlistEntryDto {
  userId: string;
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface WatchlistItemDto extends WatchlistEntryDto {
  anime: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    accentHex: string | null;
    episodeCount: number | null;
  };
}
