import { Equals, IsString } from "class-validator";

/**
 * DELETE /users/me requires the user to literally type "DELETE" — same
 * pattern as GitHub's repo deletion. Cheap server-side defense against
 * accidental fetch-call clicks while we don't have a re-auth challenge
 * (Better Auth doesn't expose one out of the box).
 */
export class DeleteAccountDto {
  @IsString()
  @Equals("DELETE")
  confirm!: "DELETE";
}
