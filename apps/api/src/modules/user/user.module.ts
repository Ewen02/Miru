import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";
import { GetUserProfileUseCase } from "./application/use-cases/get-user-profile.use-case";
import { GetUserLifetimeStatsUseCase } from "./application/use-cases/get-user-lifetime-stats.use-case";
import { GetUserYearInReviewUseCase } from "./application/use-cases/get-user-year-in-review.use-case";
import { USER_REPOSITORY } from "./application/tokens";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { UserController } from "./infrastructure/http/user.controller";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    GetCurrentUserUseCase,
    GetUserProfileUseCase,
    GetUserLifetimeStatsUseCase,
    GetUserYearInReviewUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY, GetCurrentUserUseCase],
})
export class UserModule {}
