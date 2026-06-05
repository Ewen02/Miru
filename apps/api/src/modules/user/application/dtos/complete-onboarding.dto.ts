import { ArrayMaxSize, IsArray, IsString, MaxLength } from "class-validator";

/**
 * POST /users/me/onboarding/complete — body. Persists the picks (anime ids)
 * and genres the user chose during /onboard so the empty-watchlist /
 * cold-start recommender has signal from minute one.
 *
 * Both arrays default to []. The use case clamps animeIds to 10 and genres
 * to 24 after dedup, so over-long payloads silently truncate.
 */
export class CompleteOnboardingDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  animeIds: string[] = [];

  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  genres: string[] = [];
}
