import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { WatchlistModule } from "@modules/watchlist/watchlist.module";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";
import { GetUserProfileUseCase } from "./application/use-cases/get-user-profile.use-case";
import { GetUserLifetimeStatsUseCase } from "./application/use-cases/get-user-lifetime-stats.use-case";
import { GetUserYearInReviewUseCase } from "./application/use-cases/get-user-year-in-review.use-case";
import { ListUserSessionsUseCase } from "./application/use-cases/list-user-sessions.use-case";
import { RevokeUserSessionUseCase } from "./application/use-cases/revoke-user-session.use-case";
import { GetUserPreferencesUseCase } from "./application/use-cases/get-user-preferences.use-case";
import { UpdateUserPreferencesUseCase } from "./application/use-cases/update-user-preferences.use-case";
import { DeleteUserAccountUseCase } from "./application/use-cases/delete-user-account.use-case";
import { RestoreUserAccountUseCase } from "./application/use-cases/restore-user-account.use-case";
import { UpdateMyBioUseCase } from "./application/use-cases/update-my-bio.use-case";
import { CompleteOnboardingUseCase } from "./application/use-cases/complete-onboarding.use-case";
import { GetOnboardingSnapshotUseCase } from "./application/use-cases/get-onboarding-snapshot.use-case";
import { ExportUserDataUseCase } from "./application/use-cases/export-user-data.use-case";
import { USER_REPOSITORY } from "./application/tokens";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { UserController } from "./infrastructure/http/user.controller";

@Module({
  // WatchlistModule re-exported here so CompleteOnboardingUseCase can call
  // the WATCHLIST_REPOSITORY token without a circular import via events.
  imports: [PrismaModule, WatchlistModule],
  controllers: [UserController],
  providers: [
    GetCurrentUserUseCase,
    GetUserProfileUseCase,
    GetUserLifetimeStatsUseCase,
    GetUserYearInReviewUseCase,
    ListUserSessionsUseCase,
    RevokeUserSessionUseCase,
    GetUserPreferencesUseCase,
    UpdateUserPreferencesUseCase,
    DeleteUserAccountUseCase,
    RestoreUserAccountUseCase,
    UpdateMyBioUseCase,
    CompleteOnboardingUseCase,
    GetOnboardingSnapshotUseCase,
    ExportUserDataUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY, GetCurrentUserUseCase, GetUserPreferencesUseCase],
})
export class UserModule {}
