import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";
import { USER_REPOSITORY } from "./application/tokens";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { UserController } from "./infrastructure/http/user.controller";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    GetCurrentUserUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY, GetCurrentUserUseCase],
})
export class UserModule {}
