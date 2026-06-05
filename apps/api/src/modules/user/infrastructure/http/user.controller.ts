import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type {
  UserActiveSessionDto,
  UserLifetime,
  UserPreferencesDto,
  UserProfile,
  YearInReviewDto,
} from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { CurrentSessionId } from "@auth/current-session-id.decorator";
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case";
import { GetUserProfileUseCase } from "../../application/use-cases/get-user-profile.use-case";
import { GetUserLifetimeStatsUseCase } from "../../application/use-cases/get-user-lifetime-stats.use-case";
import { GetUserYearInReviewUseCase } from "../../application/use-cases/get-user-year-in-review.use-case";
import { ListUserSessionsUseCase } from "../../application/use-cases/list-user-sessions.use-case";
import { RevokeUserSessionUseCase } from "../../application/use-cases/revoke-user-session.use-case";
import { GetUserPreferencesUseCase } from "../../application/use-cases/get-user-preferences.use-case";
import { UpdateUserPreferencesUseCase } from "../../application/use-cases/update-user-preferences.use-case";
import { DeleteUserAccountUseCase } from "../../application/use-cases/delete-user-account.use-case";
import { UpdateMyBioUseCase } from "../../application/use-cases/update-my-bio.use-case";
import { CompleteOnboardingUseCase } from "../../application/use-cases/complete-onboarding.use-case";
import { GetOnboardingSnapshotUseCase } from "../../application/use-cases/get-onboarding-snapshot.use-case";
import { ExportUserDataUseCase, type UserDataExport } from "../../application/use-cases/export-user-data.use-case";
import { UpdateUserPreferencesDto } from "../../application/dtos/update-preferences.dto";
import { CompleteOnboardingDto } from "../../application/dtos/complete-onboarding.dto";
import { DeleteAccountDto } from "../../application/dtos/delete-account.dto";
import { UpdateBioDto } from "../../application/dtos/update-bio.dto";

interface UserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  twoFactorEnabled: boolean;
  bio: string | null;
}

@Controller("users")
export class UserController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly getUserLifetime: GetUserLifetimeStatsUseCase,
    private readonly getUserYearInReview: GetUserYearInReviewUseCase,
    private readonly listUserSessions: ListUserSessionsUseCase,
    private readonly revokeUserSession: RevokeUserSessionUseCase,
    private readonly getUserPreferences: GetUserPreferencesUseCase,
    private readonly updateUserPreferences: UpdateUserPreferencesUseCase,
    private readonly deleteUserAccount: DeleteUserAccountUseCase,
    private readonly updateMyBio: UpdateMyBioUseCase,
    private readonly completeOnboarding: CompleteOnboardingUseCase,
    private readonly getOnboardingSnapshot: GetOnboardingSnapshotUseCase,
    private readonly exportUserData: ExportUserDataUseCase,
  ) {}

  @Get("me")
  @UseGuards(AuthRequiredGuard)
  async me(@CurrentUserId() userId: string): Promise<UserDto> {
    const user = await this.getCurrentUser.execute(userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
      twoFactorEnabled: user.twoFactorEnabled,
      bio: user.bio,
    };
  }

  /**
   * Personal lifetime aggregation — declared before `:handle` so the literal
   * path `me/lifetime-stats` wins over the param match.
   */
  @Get("me/lifetime-stats")
  @UseGuards(AuthRequiredGuard)
  async lifetimeStats(@CurrentUserId() userId: string): Promise<UserLifetime> {
    const { joinedAt, stats } = await this.getUserLifetime.execute({ userId });
    return {
      joinedAt: joinedAt ? joinedAt.toISOString() : null,
      stats: {
        ...stats,
        firstAddedAt: stats.firstAddedAt ? stats.firstAddedAt.toISOString() : null,
      },
    };
  }

  @Get("me/sessions")
  @UseGuards(AuthRequiredGuard)
  async sessions(
    @CurrentUserId() userId: string,
    @CurrentSessionId() currentSessionId: string | null,
  ): Promise<UserActiveSessionDto[]> {
    const sessions = await this.listUserSessions.execute({ userId, currentSessionId });
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      current: s.current,
    }));
  }

  @Delete("me/sessions/:sessionId")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async revokeSession(
    @Param("sessionId") sessionId: string,
    @CurrentUserId() userId: string,
    @CurrentSessionId() currentSessionId: string | null,
  ): Promise<void> {
    await this.revokeUserSession.execute({ userId, sessionId, currentSessionId });
  }

  @Get("me/year-in-review/:year")
  @UseGuards(AuthRequiredGuard)
  async yearInReview(
    @Param("year", ParseIntPipe) year: number,
    @CurrentUserId() userId: string,
  ): Promise<YearInReviewDto> {
    return this.getUserYearInReview.execute({ userId, year });
  }

  @Get("me/preferences")
  @UseGuards(AuthRequiredGuard)
  preferences(@CurrentUserId() userId: string): Promise<UserPreferencesDto> {
    return this.getUserPreferences.execute({ userId });
  }

  @Patch("me/preferences")
  @UseGuards(AuthRequiredGuard)
  updatePreferences(
    @CurrentUserId() userId: string,
    @Body() patch: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    return this.updateUserPreferences.execute({ userId, patch });
  }

  /**
   * Hard delete. Requires the user to literally type "DELETE" in the
   * body (see DeleteAccountDto). Cascades to every row owned by the
   * user — there's no soft-delete recovery window in our model.
   */
  @Delete("me")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async deleteAccount(
    @CurrentUserId() userId: string,
    @Body() _body: DeleteAccountDto,
  ): Promise<void> {
    await this.deleteUserAccount.execute({ userId });
  }

  /**
   * Public bio update. Empty string clears it. 250-char cap enforced
   * by both the DTO and the use case.
   */
  @Patch("me/bio")
  @UseGuards(AuthRequiredGuard)
  bio(
    @CurrentUserId() userId: string,
    @Body() body: UpdateBioDto,
  ): Promise<{ bio: string | null }> {
    return this.updateMyBio.execute({ userId, bio: body.bio });
  }

  /**
   * GDPR Article 20 — data portability. Returns every row the user owns
   * as a JSON blob; client downloads it directly. We don't store the file
   * anywhere — keep the user in control of where their copy lives.
   *
   * Content-Disposition forces a download with a date-stamped filename so
   * the browser doesn't try to render the JSON in a tab.
   */
  @Get("me/export")
  @UseGuards(AuthRequiredGuard)
  async exportMyData(@CurrentUserId() userId: string): Promise<UserDataExport> {
    return this.exportUserData.execute({ userId });
  }

  /**
   * Persist the user's investment from /onboard: picks become WatchlistEntry
   * PLANNED rows, genres land on UserPreferences, and onboardedAt is stamped
   * for first-finish-only nudges. Idempotent — replaying the call is safe.
   */
  @Post("me/onboarding/complete")
  @UseGuards(AuthRequiredGuard)
  onboardingComplete(
    @CurrentUserId() userId: string,
    @Body() body: CompleteOnboardingDto,
  ): Promise<{
    onboardedAt: string;
    picksAdded: number;
    picksAlreadyPresent: number;
    genresStored: number;
  }> {
    return this.completeOnboarding
      .execute({ userId, animeIds: body.animeIds, genres: body.genres })
      .then((r) => ({
        onboardedAt: r.onboardedAt.toISOString(),
        picksAdded: r.picksAdded,
        picksAlreadyPresent: r.picksAlreadyPresent,
        genresStored: r.genresStored,
      }));
  }

  /**
   * Lightweight "where is the user in their journey?" snapshot used by the
   * home page to decide whether to render the AniList-import banner or
   * other new-user nudges. Cheap (one indexed query + one count).
   */
  @Get("me/onboarding/snapshot")
  @UseGuards(AuthRequiredGuard)
  async onboardingSnapshot(@CurrentUserId() userId: string): Promise<{
    onboardedAt: string | null;
    watchlistCount: number;
    joinedAt: string | null;
    daysSinceJoined: number;
    shouldNudgeImport: boolean;
  }> {
    const snap = await this.getOnboardingSnapshot.execute(userId);
    return {
      onboardedAt: snap.onboardedAt ? snap.onboardedAt.toISOString() : null,
      watchlistCount: snap.watchlistCount,
      joinedAt: snap.joinedAt ? snap.joinedAt.toISOString() : null,
      daysSinceJoined: snap.daysSinceJoined,
      shouldNudgeImport: snap.shouldNudgeImport,
    };
  }

  @Get(":handle")
  async profile(@Param("handle") handle: string): Promise<UserProfile> {
    const { user, joinedAt, isPro, stats, favorites, reviews } = await this.getUserProfile.execute({
      handle,
    });

    return {
      id: user.id,
      handle: user.name,
      name: user.name,
      image: user.image,
      bio: user.bio,
      joinedAt: joinedAt ? joinedAt.toISOString() : null,
      isPro,
      stats,
      favorites,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        anime: r.anime,
      })),
    };
  }
}
