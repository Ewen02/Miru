import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { AnimeStatus, AnimeFormat } from "@miru/types";

export type CatalogSort = "RATING" | "POPULARITY" | "RECENCY" | "EPISODE_COUNT";

export class AnimeCatalogQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @IsOptional()
  @IsEnum(AnimeFormat)
  format?: AnimeFormat;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearTo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  episodesMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  episodesMax?: number;

  /** Streaming platform slug(s). Accepts repeated query param or single value. */
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  streamingPlatforms?: string[];

  /** Source material codes — same any-match shape as genres/platforms. */
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  sources?: string[];

  @IsOptional()
  @IsEnum(["RATING", "POPULARITY", "RECENCY", "EPISODE_COUNT"])
  sort?: CatalogSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;
}
