import { IsString, MaxLength } from "class-validator";

/**
 * PATCH /users/me/bio. Empty string explicitly allowed → clears the bio.
 * Trimming + null conversion happens in the use case.
 */
export class UpdateBioDto {
  @IsString()
  @MaxLength(250)
  bio!: string;
}
