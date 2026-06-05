import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from "class-validator";

/**
 * PATCH /users/me/preferences. Every field optional — client sends only
 * what it wants to change. Quiet hours must be sent as a pair (both set
 * or both null) — application-layer use case re-validates that pairing.
 */
export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNewEpisodes?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWeeklyRecap?: boolean;

  @IsOptional()
  @IsBoolean()
  emailReviewReply?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNewFollower?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEpisodeAired?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppRecommendation?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppMention?: boolean;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(0)
  @Max(23)
  quietFromHour?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(0)
  @Max(23)
  quietToHour?: number | null;

  /** Genre slugs the user enjoys — used by the cold-start recommender. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(24)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  favoriteGenres?: string[];

  /** When true, the public profile is hidden from everyone but the owner. */
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
